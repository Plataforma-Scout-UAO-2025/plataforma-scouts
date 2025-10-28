package uao.edu.co.scouts_project.organigrama.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory; 
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.IGroupService;
import uao.edu.co.scouts_project.organigrama.interfaces.IMapper;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class GroupService implements IGroupService {

    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;
    private final IMapper<CreatingGroupDTO, Group> groupMapper;

    private static final Logger log = LoggerFactory.getLogger(GroupService.class);

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

    public GroupService(GroupRepository groupRepository,
            TenantRepository tenantRepository,
            @Qualifier("organigramaStorageService") SupabaseStorageService storageService,
            IMapper<CreatingGroupDTO, Group> groupMapper) {
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
        this.groupMapper = groupMapper;
    }

    @Transactional(readOnly = true)
    public List<GroupResponseDTO> getGroupsByTenant(String tenantId) {
        ensureTenantExists(tenantId);
        // 1. Obtener todos los grupos en una sola consulta
        List<Group> groups = groupRepository.findByTenantId(tenantId);

        // 2. Recolectar TODOS los UUIDs de TODAS las imágenes de TODOS los grupos
        Set<UUID> allImageIds = groups.stream()
                .flatMap(group -> Stream.of(group.getLogoObjectId(), group.getScarfObjectId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 3. Hacer UNA SOLA consulta a la base de datos para obtener todas las URLs
        Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(allImageIds);

        // 4. Construir las respuestas usando el mapa (esto ya no hace consultas a la
        // DB)
        return groups.stream()
                .map(group -> toResponseDTO(group, urlMap))
                .collect(Collectors.toList());
    }

    public boolean validateSlug(String slug) {
        // Validar formato
        if (slug == null || !SLUG_PATTERN.matcher(slug).matches()) {
            return false;
        }

        // Validar unicidad global
        return !groupRepository.existsBySlug(slug);
    }

    @Transactional(readOnly = true)
    public GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);
        return toResponseDTO(group); // La versión simple es suficiente para un solo objeto
    }

    public GroupResponseDTO createGroup(CreatingGroupDTO dto) {
        if (!validateSlug(dto.getSlug())) {
            throw new IllegalArgumentException(
                    dto.getSlug() + " Slug no válido, debe de seguir el patrón: " + SLUG_PATTERN.pattern());
        }

        Group entity;
        try {
            entity = groupMapper.toEntity(dto);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al crear el grupo: " + e.getMessage(), e);
        }
        groupRepository.save(entity);
        return toResponseDTO(entity);
    }

    @Transactional
    public GroupResponseDTO createGroup(String tenantId, GroupDTO dto) {
        ensureTenantExists(tenantId);

        if (groupRepository.existsBySlug(dto.slug())) {
            throw new IllegalArgumentException("Grupo con Slug '" + dto.slug() + "' ya existe ");
        }

        if (!validateSlug(dto.slug())) {
            throw new IllegalArgumentException(
                    dto.slug() + " Slug no válido, debe de seguir el patrón: " + SLUG_PATTERN.pattern());
        }

        Group group;
        try {
            group = new Group(tenantId, dto.slug(), dto.name());
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al crear el grupo: " + e.getMessage(), e);
        }
        mapDtoToEntity(dto, group);

        Group saved = groupRepository.save(group);
        return toResponseDTO(saved);
    }

    @Transactional
    public GroupResponseDTO updateGroup(String tenantId, String groupSlug, GroupDTO dto) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        if (dto.logoObjectId() != null && !Objects.equals(dto.logoObjectId(), group.getLogoObjectId())) {
            storageService.deleteFileByObjectId(group.getLogoObjectId());
        }
        if (dto.scarfObjectId() != null && !Objects.equals(dto.scarfObjectId(), group.getScarfObjectId())) {
            storageService.deleteFileByObjectId(group.getScarfObjectId());
        }

        mapDtoToEntity(dto, group);
        Group updated = groupRepository.save(group);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteGroup(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        storageService.deleteFileByObjectId(group.getLogoObjectId());
        storageService.deleteFileByObjectId(group.getScarfObjectId());

        groupRepository.delete(group);
    }

    @Transactional
    public void deleteLogoImage(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        UUID logoIdToDelete = group.getLogoObjectId();
        if (logoIdToDelete != null) {
            storageService.deleteFileByObjectId(logoIdToDelete);
            group.setLogoObjectId(null);
            groupRepository.save(group);
        }
    }

    @Transactional
    public void deleteScarfImage(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        UUID scarfIdToDelete = group.getScarfObjectId();
        if (scarfIdToDelete != null) {
            storageService.deleteFileByObjectId(scarfIdToDelete);
            group.setScarfObjectId(null);
            groupRepository.save(group);
        }
    }

    @Transactional
    public void updateLogo(String tenantId, String groupSlug, UUID logoObjectId) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        // Eliminar logo anterior si existe y es diferente
        if (group.getLogoObjectId() != null && !group.getLogoObjectId().equals(logoObjectId)) {
            storageService.deleteFileByObjectId(group.getLogoObjectId());
        }

        group.setLogoObjectId(logoObjectId);
        groupRepository.save(group);
    }

    @Transactional
    public void updateScarf(String tenantId, String groupSlug, UUID scarfObjectId) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);

        // Eliminar pañolón anterior si existe y es diferente
        if (group.getScarfObjectId() != null && !group.getScarfObjectId().equals(scarfObjectId)) {
            storageService.deleteFileByObjectId(group.getScarfObjectId());
        }

        group.setScarfObjectId(scarfObjectId);
        groupRepository.save(group);
    }

    private Group findGroupOrThrow(String tenantId, String groupSlug) {
        return groupRepository.findByTenantIdAndSlug(tenantId, groupSlug)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }

    private void ensureTenantExists(String tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new IllegalArgumentException("Tenant not found with id: " + tenantId);
        }
    }

    private void mapDtoToEntity(GroupDTO dto, Group group) {
        if (dto.name() != null)
            group.setName(dto.name());
        if (dto.district() != null)
            group.setDistrict(dto.district());
        if (dto.identifierNumber() != null)
            group.setIdentifierNumber(dto.identifierNumber());
        if (dto.address() != null)
            group.setAddress(dto.address());
        if (dto.phone() != null)
            group.setPhone(dto.phone());
        if (dto.email() != null)
            group.setEmail(dto.email());
        if (dto.foundedIn() != null)
            group.setFoundedIn(dto.foundedIn());
        if (dto.motto() != null)
            group.setMotto(dto.motto());
        if (dto.mission() != null)
            group.setMission(dto.mission());
        if (dto.vision() != null)
            group.setVision(dto.vision());
        if (dto.history() != null)
            group.setHistory(dto.history());
        if (dto.logoObjectId() != null)
            group.setLogoObjectId(dto.logoObjectId());
        if (dto.scarfObjectId() != null)
            group.setScarfObjectId(dto.scarfObjectId());
        if (dto.socialLinks() != null)
            group.setSocialLinks(dto.socialLinks());
        if (dto.config() != null)
            group.setConfig(dto.config());
        if (dto.isActive() != null)
            group.setIsActive(dto.isActive());
        if (dto.status() != null)
            group.setStatus(dto.status());
    }

    // Método `toResponseDTO` sobrecargado: uno para carga masiva (más eficiente)
    private GroupResponseDTO toResponseDTO(Group group, Map<UUID, String> urlMap) {
        Map<UUID, String> safe = (urlMap != null) ? urlMap : Map.of();
        String logoUrl = (group.getLogoObjectId() != null) ? safe.get(group.getLogoObjectId()) : null;
        String scarfUrl = (group.getScarfObjectId() != null) ? safe.get(group.getScarfObjectId()) : null;

        Map<String, Object> social = (group.getSocialLinks() != null) ? group.getSocialLinks() : Map.of();
        Map<String, Object> conf = (group.getConfig() != null) ? group.getConfig() : Map.of();

        return new GroupResponseDTO(
                group.getGroupId(), group.getTenantId(), group.getSlug(), group.getName(),
                group.getDistrict(), group.getIdentifierNumber(), group.getAddress(), group.getPhone(),
                group.getEmail(), group.getFoundedIn(), group.getMotto(), group.getMission(),
                group.getVision(), group.getHistory(), logoUrl, scarfUrl, social,
                conf, group.getIsActive(), group.getStatus(),
                group.getCreatedAt(), group.getUpdatedAt());
    }

    // Y otro para casos de un solo objeto, que llama al servicio de carga masiva
    // internamente
    private GroupResponseDTO toResponseDTO(Group group) {
        Set<UUID> ids = Stream.of(group.getLogoObjectId(), group.getScarfObjectId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return toResponseDTO(group, Map.of()); // Evita una llamada innecesaria a la DB
        }
        Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(ids);
        return toResponseDTO(group, urlMap);
    }
}