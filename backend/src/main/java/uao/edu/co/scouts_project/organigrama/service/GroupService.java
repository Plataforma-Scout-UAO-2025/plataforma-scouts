
package uao.edu.co.scouts_project.organigrama.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;
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

    @Transactional(readOnly = true)
    public GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);
        return toResponseDTO(group); // La versión simple es suficiente para un solo objeto
    }

    @Transactional
    public GroupResponseDTO createGroup(String tenantId, GroupDTO dto) {
        ensureTenantExists(tenantId);

        // Solo un grupo por tenant
        if (groupRepository.existsByTenantId(dto.tenantId())) {
            throw new IllegalArgumentException("Ya existe un grupo para el tenant: " + dto.tenantId());
        }

        validateSlugFormat(dto.slug());
        ensureSlugIsUnique(dto.slug());

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
    public GroupResponseDTO createGroup(CreatingGroupDTO dto) {
        ensureTenantExists(dto.getTenantId());

        // Solo un grupo por tenant
        if (groupRepository.existsByTenantId(dto.getTenantId())) {
            throw new IllegalArgumentException("Ya existe un grupo para el tenant: " + dto.getTenantId());
        }

        validateSlugFormat(dto.getSlug());
        ensureSlugIsUnique(dto.getSlug());

        Group entity;
        try {
            entity = groupMapper.toEntity(dto);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al crear el grupo: " + e.getMessage(), e);
        }

        groupRepository.save(entity);
        return toResponseDTO(entity);
    }

    public void validateSlugFormat(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            throw new IllegalArgumentException("El slug no puede estar vacío.");
        }
        if (!SLUG_PATTERN.matcher(slug).matches()) {
            throw new IllegalArgumentException(
                    "Slug inválido. Solo minúsculas, números y guiones medios. Ej: 'grupo-exploradores'");
        }
    }

    public void ensureSlugIsUnique(String slug) {
        if (groupRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("El slug '" + slug + "' ya está en uso en otro grupo.");
        }
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
    public GroupResponseDTO updateGroup(String tenantId, String slug, UpdatingGroupDTO dto) {
        ensureTenantExists(tenantId);

        // 1. Buscar el grupo actual
        Group existing = findGroupOrThrow(tenantId, slug);

        // 2. Validar slug (si cambia)
        if (dto.getSlug() != null && !dto.getSlug().equals(existing.getSlug())) {
            validateSlugFormat(dto.getSlug());
            ensureSlugIsUnique(dto.getSlug());
            existing.setSlug(dto.getSlug());
        }

        // 3. Mapear campos no nulos desde el DTO hacia la entidad
        if (dto.getName() != null)
            existing.setName(dto.getName());
        if (dto.getDistrict() != null)
            existing.setDistrict(dto.getDistrict());
        if (dto.getIdentifierNumber() != null)
            existing.setIdentifierNumber(dto.getIdentifierNumber());
        if (dto.getAddress() != null)
            existing.setAddress(dto.getAddress());
        if (dto.getPhone() != null)
            existing.setPhone(dto.getPhone());
        if (dto.getEmail() != null)
            existing.setEmail(dto.getEmail());
        if (dto.getFoundedIn() != null)
            existing.setFoundedIn(dto.getFoundedIn());
        if (dto.getMotto() != null)
            existing.setMotto(dto.getMotto());
        if (dto.getMission() != null)
            existing.setMission(dto.getMission());
        if (dto.getVision() != null)
            existing.setVision(dto.getVision());
        if (dto.getHistory() != null)
            existing.setHistory(dto.getHistory());
        if (dto.getLogoObjectId() != null)
            existing.setLogoObjectId(dto.getLogoObjectId());
        if (dto.getScarfObjectId() != null)
            existing.setScarfObjectId(dto.getScarfObjectId());
        if (dto.getSocialLinks() != null)
            existing.setSocialLinks(dto.getSocialLinks());
        if (dto.getConfig() != null)
            existing.setConfig(dto.getConfig());
        if (dto.getIsActive() != null)
            existing.setIsActive(dto.getIsActive());
        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());

        // 4. Guardar los cambios
        Group updated = groupRepository.save(existing);

        // 5. Retornar DTO de respuesta con URLs y demás
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

    @Override
    public GroupResponseDTO[] getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toArray(GroupResponseDTO[]::new);
    }

    @Override
    public String deleteGroup(Long groupId) {
        groupRepository.deleteById(groupId);
        return "Grupo eliminado con éxito.";
    }

    @Transactional
    @Override
    public GroupResponseDTO updateGroupActiveStatus(String tenantId, String groupSlug, Boolean isActive) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);
        group.setIsActive(isActive);
        groupRepository.save(group);
        return toResponseDTO(group);
    }

}