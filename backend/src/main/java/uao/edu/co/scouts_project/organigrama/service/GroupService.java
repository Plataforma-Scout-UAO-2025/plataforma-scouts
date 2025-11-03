package uao.edu.co.scouts_project.organigrama.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import uao.edu.co.scouts_project.domain.port.ConnectionQueryPort;
import uao.edu.co.scouts_project.domain.port.OrganizationQueryPort;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.TenantInfoDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.CreateGroupAdminRequestDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupAdminCreatedResponseDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.IGroupService;
import uao.edu.co.scouts_project.organigrama.interfaces.ITenantService;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;
import uao.edu.co.scouts_project.application.service.IAuth0Service;
import org.springframework.context.annotation.Lazy;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;

import java.time.LocalDate;
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

    private final ConnectionQueryPort connectionQueryPort;
    private final OrganizationQueryPort organizationQueryPort;
    private final ITenantService tenantService;
    private final IAuth0Service auth0Service;

    private static final Logger logger = LoggerFactory.getLogger(GroupService.class);

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    private static final String BUCKET_IMAGES = "images";

    public GroupService(
            @Qualifier("organigramaStorageService") SupabaseStorageService storageService,
            ConnectionQueryPort connectionQueryPort,
            ITenantService tenantService,
            OrganizationQueryPort organizationQueryPort,
            TenantRepository tenantRepository,
            GroupRepository groupRepository,
            @Lazy IAuth0Service auth0Service) {
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
        this.connectionQueryPort = connectionQueryPort;
        this.organizationQueryPort = organizationQueryPort;
        this.tenantService = tenantService;
        this.auth0Service = auth0Service;
    }

    @Override
    public GroupResponseDTO createGroup(GroupDTO dto) {
        String tenantId = dto.tenantId();

        ensureTenantExists(tenantId);

        // Solo un grupo por tenant: no se permite más de un grupo por tenant
        if (groupRepository.existsByTenantId(tenantId)) {
            throw new IllegalArgumentException("No se puede crear más de un grupo para el tenant: " + tenantId);
        }
        validateSlugFormat(dto.slug());

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

    @Override
    public GroupResponseDTO createGroupFull(GroupDTO group, MultipartFile imageFile) {

        // // 1. Obtener el Grupo y el Slug [Creado por el ADMIN_GLOBAL]
        String slug = group.slug();

        validateSlugFormat(slug);

        // 2, Create la Organization en Auth0 UNIENDO LA CONEXIÓN de la BD de Auth0 (con
        // el identificador 'con_id' )
        String displayName = slug;

        logger.info("Se creará una organización en Auth0.");

        // Si llega una imagen, subirla a Supabase y usar su URL pública para la
        // organización
        String organizationImageUrl = "https://img.freepik.com/vector-gratis/vector-diseno-degradado-colorido-pajaro_343694-2506.jpg?semt=ais_hybrid&w=740&q=80";
        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                UUID objectId = storageService.uploadFileAndGetObjectId(imageFile, BUCKET_IMAGES);
                String publicUrl = storageService.getPublicUrlFromObjectId(objectId);
                if (publicUrl != null && !publicUrl.isBlank()) {
                    organizationImageUrl = publicUrl;
                }
            }
        } catch (Exception e) {
            logger.error("Error subiendo imagen para organización, se usará imagen por defecto: {}", e.getMessage());
        }

        // Crear Organización
        String orgId = organizationQueryPort.createOrganization(displayName, organizationImageUrl);

        logger.info("OK: Organización creada con ÉXITO.");

        // - [Listo] Create la Conexión a BD en Auth0. (Con Username Email,y Password)
        // de forma: $'uep-{tenant.slug}'
        logger.info("Se creará la conexión a la BD de Auth0 con el UEP-{orgId}: " + orgId);

        connectionQueryPort.createOrUpdateAuth0DbConnection(orgId);

        logger.info("OK: Conexión creada con ÉXITO.");

        // - Crear Usuario con rol de ADMIN_GLOBAL en la Base de Datos
        // de conexión de dicha organization
        // (con el 'con_id' o como se específique) en Auth0.
        // logger.info("Se creará el super usuario en Auth0");

        // // Crear SUPERUSUARIO ADMIN_GLOBAL en la conexión recién creada
        // CreateUserCommandDTO superUserCmd = new CreateUserCommandDTO(
        // SUPERUSEREMAIL,
        // SUPERUSERPASSWORD,
        // SUPERUSER_USERNAME);

        // logger.info("Creando superusuario en conexión: {}", connectionRef);
        // CreatedUserDTO createdSuperUser = this.createUserInConnection(superUserCmd,
        // connectionRef);
        // // Asociar al org y asignar rol ADMIN_GLOBAL
        // addUserToOrganization(orgId, createdSuperUser.getId());
        // assignRole(createdSuperUser.getId(), Role.ADMIN_GLOBAL);

        // logger.info("OK: Usuario ADMIN_GLOBAL creado con éxito.");

        // Crear el Tenant en BD con el org_id de Auth0

        logger.info("\n\nSe creará el DTO de Tenant");

        var tenantInfo = new TenantInfoDTO(
                orgId,
                slug,
                "ACTIVE",
                LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC),
                LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC));

        logger.info("Se creará el Tenant en BD");

        tenantService.createTenantInfo(tenantInfo);

        logger.info("OK: Se crea el tenant con éxito en BD.");
        logger.info("Se creará un nuevo grupo.");

        logger.info("\n\nSe creará un grupo en BD.");

        GroupDTO finalGroup = new GroupDTO(
                group.groupId(),
                orgId,
                group.slug(),
                group.name(),
                group.district(),
                group.identifierNumber(),
                group.address(),
                group.phone(),
                group.email(),
                group.foundedIn(),
                group.motto(),
                group.mission(),
                group.vision(),
                group.history(),
                group.logoObjectId(),
                group.scarfObjectId(),
                group.socialLinks(),
                group.config(),
                true,
                "ACTIVE",
                null,
                null);
        GroupResponseDTO response = createGroup(finalGroup);

        logger.info("OK: Se crea el grupo con éxito en BD.");
        return response;

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

    @Override
    public GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);
        return toResponseDTO(group); // La versión simple es suficiente para un solo objeto
    }

    @Override
    public void ensureSlugIsUnique(String slug) {
        if (groupRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("El slug '" + slug + "' ya está en uso en otro grupo.");
        }
    }

    @Override
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

    @Override
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

    @Override
    public GroupResponseDTO updateGroupActiveStatus(String tenantId, String groupSlug, Boolean isActive) {
        ensureTenantExists(tenantId);
        Group group = findGroupOrThrow(tenantId, groupSlug);
        group.setIsActive(isActive);
        groupRepository.save(group);
        return toResponseDTO(group);
    }

    @Override
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

    @Override
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

    @Override
    public String deleteGroup(Long groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group != null) {
            if (group.getLogoObjectId() != null) {
                storageService.deleteFileByObjectId(group.getLogoObjectId());
            }
            if (group.getScarfObjectId() != null) {
                storageService.deleteFileByObjectId(group.getScarfObjectId());
            }
            groupRepository.deleteById(groupId);
        }
        return "Grupo con ID: " + groupId + " ha sido eliminado.";
    }

    @Override
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

    @Override
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

    private Group findGroupOrThrow(String tenantId, String groupSlug) {
        return groupRepository.findByTenantIdAndSlug(tenantId, groupSlug)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }

    private void ensureTenantExists(String tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new IllegalArgumentException("Tenant not found with id: " + tenantId);
        }
    }

    @Override
    public GroupResponseDTO[] getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toArray(GroupResponseDTO[]::new);
    }

    @Override
    public void validateSlugFormat(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            throw new IllegalArgumentException("El slug no puede estar vacío.");
        }
        if (!SLUG_PATTERN.matcher(slug).matches()) {
            throw new IllegalArgumentException(
                    "Slug inválido. Solo minúsculas, números y guiones medios. Ej: 'grupo-exploradores'");
        }
    }

    @Override
    @Transactional
    public GroupAdminCreatedResponseDTO addGroupAdmin(Long groupId, CreateGroupAdminRequestDTO request) {
        // 1) Buscar grupo y obtener tenant/org id
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado para id=" + groupId));

        String tenantId = group.getTenantId();

        // 2) Construir comando para Auth0 con rol ADMIN_GRUPO
        CreateUserWithRoleCommandDTO cmd = new CreateUserWithRoleCommandDTO(
                request.email(),
                request.password(),
                request.username(),
                Role.ADMIN_GRUPO);

        var created = auth0Service.createUserWithRoleInOrganizationElevated(cmd, tenantId);

        return new GroupAdminCreatedResponseDTO(
                groupId,
                tenantId,
                created.getId(),
                created.getEmail(),
                Role.ADMIN_GRUPO.name());
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

    public void mapDtoToEntity(GroupDTO dto, Group group) {
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

}