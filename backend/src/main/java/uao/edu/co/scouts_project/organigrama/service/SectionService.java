package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO.GalleryItemDTO;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;
import static java.util.stream.Collectors.toList;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.UUID;

@Service
public class SectionService {

    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;
    private final SubgroupService subgroupService;

    public SectionService(SectionRepository sectionRepository, GroupRepository groupRepository,
                          TenantRepository tenantRepository,
                          @Qualifier("organigramaStorageService") SupabaseStorageService storageService,
                          SubgroupService subgroupService) {
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
        this.subgroupService = subgroupService;
    }

    @Transactional(readOnly = true)
    public List<SectionResponseDTO> getSectionsByGroup(String tenantId, String groupSlug) {
    Group group = getGroup(tenantId, groupSlug);
        // 1. Obtener todas las secciones en una consulta
        List<Section> sections = sectionRepository.findByTenantIdAndGroupId(group.getTenantId(), group.getGroupId());

        // 2. Recolectar TODOS los UUIDs de todas las imágenes (íconos, fotos principales y galerías)
        Set<UUID> allImageIds = sections.stream()
                .flatMap(section -> {
                    Stream<UUID> galleryStream = (section.getGalleryObjectIds() != null)
                            ? Arrays.stream(section.getGalleryObjectIds())
                            : Stream.empty();
                    return Stream.of(
                                    Stream.of(section.getIconObjectId()),
                                    Stream.of(section.getPhotoPrincipal()),
                                    galleryStream)
                            .flatMap(s -> s);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 3. UNA SOLA consulta para obtener todas las URLs (con verificación de null)
        Map<UUID, String> urlMap = getUrlMapFromIds(allImageIds);

        // 4. Construir las respuestas usando el mapa eficiente
        return sections.stream()
                .map(section -> toResponseDTO(section, urlMap))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SectionResponseDTO getSectionById(String tenantId, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);
        return toResponseDTO(section);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSectionWithSubgroups(String tenantId, String groupSlug, Long sectionId) {
        SectionResponseDTO section = getSectionById(tenantId, groupSlug, sectionId);
        List<SubgroupResponseDTO> subgroups = subgroupService.getSubgroupsBySection(tenantId, groupSlug, sectionId);
        return Map.of(
                "section", section,
                "subgroups", subgroups
        );
    }

    @Transactional
    public SectionResponseDTO createSection(String tenantId, String groupSlug, SectionDTO dto) {
    Group group = getGroup(tenantId, groupSlug);
        if (sectionRepository.existsByGroupIdAndName(group.getGroupId(), dto.name())) {
            throw new IllegalArgumentException("Section with name '" + dto.name() + "' already exists in this group");
        }
        Section section = new Section(group.getTenantId(), group.getGroupId(), dto.name());
        mapDtoToEntity(dto, section);
        Section saved = sectionRepository.save(section);
        return toResponseDTO(saved);
    }

    @Transactional
    public SectionResponseDTO updateSection(String tenantId, String groupSlug, Long sectionId, SectionDTO dto) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        if (storageService != null) {
            if (dto.iconObjectId() != null && !Objects.equals(dto.iconObjectId(), section.getIconObjectId())) {
                storageService.deleteFileByObjectId(section.getIconObjectId());
            }
            if (dto.photoPrincipal() != null && !Objects.equals(dto.photoPrincipal(), section.getPhotoPrincipal())) {
                storageService.deleteFileByObjectId(section.getPhotoPrincipal());
            }
            if (dto.galleryObjectIds() != null) {
                UUID[] oldArr = section.getGalleryObjectIds() != null ? section.getGalleryObjectIds() : new UUID[0];
                Set<UUID> oldSet = new HashSet<>(Arrays.asList(oldArr));
                Set<UUID> newSet = new HashSet<>(Arrays.asList(dto.galleryObjectIds()));

                // Solo borrar los que ya no están en la nueva lista
                oldSet.stream()
                        .filter(id -> !newSet.contains(id))
                        .forEach(this::safeDeleteFromStorage);

                // Actualizar a la lista nueva (conservará los IDs no eliminados)
                section.setGalleryObjectIds(newSet.toArray(UUID[]::new));
            } else {
                // No tocar gallery cuando viene null
            }
        }

        mapDtoToEntity(dto, section);
        Section updated = sectionRepository.save(section);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteSection(String tenantId, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        if (storageService != null) {
            safeDeleteFromStorage(section.getIconObjectId());
            safeDeleteFromStorage(section.getPhotoPrincipal());
            if (section.getGalleryObjectIds() != null) {
                Arrays.stream(section.getGalleryObjectIds()).forEach(this::safeDeleteFromStorage);
            }
        }

        sectionRepository.delete(section);
    }

    @Transactional
    public void deleteIconImage(String tenantId, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        UUID iconIdToDelete = section.getIconObjectId();
        if (iconIdToDelete != null && storageService != null) {
            safeDeleteFromStorage(iconIdToDelete);
            section.setIconObjectId(null);
            sectionRepository.save(section);
        }
    }

    @Transactional
    public void deletePhotoPrincipal(String tenantId, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        UUID photoPrincipalIdToDelete = section.getPhotoPrincipal();
        if (photoPrincipalIdToDelete != null && storageService != null) {
            safeDeleteFromStorage(photoPrincipalIdToDelete);
            section.setPhotoPrincipal(null);
            sectionRepository.save(section);
        }
    }

    /**
     * Método existente mantenido (void). Ahora delega al método que devuelve DTO.
     * Conserva el comportamiento de eliminar del storage.
     */
    @Transactional
    public void deleteGalleryImageById(String tenantId, String groupSlug, Long sectionId, UUID objectId) {
        deleteGalleryImageById(tenantId, groupSlug, sectionId, objectId, true);
    }

    /**
     * Nuevo método compatible que devuelve el recurso actualizado y permite controlar si se borra del storage.
     */
    @Transactional
    public SectionResponseDTO deleteGalleryImageById(String tenantId, String groupSlug, Long sectionId,
                                                     UUID objectId, boolean deleteFromStorage) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        UUID[] galleryIds = section.getGalleryObjectIds();
        if (galleryIds == null || galleryIds.length == 0) {
            throw new IllegalArgumentException("Gallery is empty or not initialized");
        }

        List<UUID> galleryIdList = new ArrayList<>(Arrays.asList(galleryIds));

        boolean removed = galleryIdList.remove(objectId);
        if (!removed) {
            throw new IllegalArgumentException("Imagen no encontrada en la galería: " + objectId);
        }

        if (deleteFromStorage) {
            safeDeleteFromStorage(objectId);
        }

        section.setGalleryObjectIds(galleryIdList.toArray(new UUID[0]));
        Section saved = sectionRepository.save(section);

        // Devolver recurso actualizado
        Set<UUID> ids = new HashSet<>();
        if (saved.getIconObjectId() != null) ids.add(saved.getIconObjectId());
        if (saved.getPhotoPrincipal() != null) ids.add(saved.getPhotoPrincipal());
        if (saved.getGalleryObjectIds() != null) ids.addAll(Arrays.asList(saved.getGalleryObjectIds()));
        Map<UUID, String> urlMap = getUrlMapFromIds(ids);
        return toResponseDTO(saved, urlMap);
    }

    @Transactional
    public void updateIcon(String tenantId, String groupSlug, Long sectionId, UUID iconObjectId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        // Eliminar ícono anterior si existe y es diferente
        if (section.getIconObjectId() != null && !section.getIconObjectId().equals(iconObjectId)) {
            if (storageService != null) {
                safeDeleteFromStorage(section.getIconObjectId());
            }
        }

        section.setIconObjectId(iconObjectId);
        sectionRepository.save(section);
    }

    @Transactional
    public void updatePhotoPrincipal(String tenantId, String groupSlug, Long sectionId, UUID photoObjectId) {
        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        // Eliminar foto anterior si existe y es diferente
        if (section.getPhotoPrincipal() != null && !section.getPhotoPrincipal().equals(photoObjectId)) {
            if (storageService != null) {
                safeDeleteFromStorage(section.getPhotoPrincipal());
            }
        }

        section.setPhotoPrincipal(photoObjectId);
        sectionRepository.save(section);
    }

    /**
     * Método existente mantenido (void). Ahora delega al método que devuelve DTO.
     */
    @Transactional
    public void patchGallery(String tenantId, String groupSlug, Long sectionId,
                             List<uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest.PatchOperation> operations) {
        // delega a la versión que retorna DTO; se ignora el resultado para compatibilidad
        patchGalleryAndReturn(tenantId, groupSlug, sectionId, operations);
    }

    /**
     * Nuevo método que aplica operaciones de galería y devuelve el recurso actualizado.
     * Mantiene la lógica existente (delete en replace/remove) y evita parseos ambiguos (UUID tipado).
     */
    @Transactional
    public SectionResponseDTO patchGalleryAndReturn(String tenantId, String groupSlug, Long sectionId,
            List<uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest.PatchOperation> operations) {

        Section section = findSectionOrThrow(tenantId, groupSlug, sectionId);

        UUID[] currentGallery = section.getGalleryObjectIds();
        if (currentGallery == null) {
            currentGallery = new UUID[0];
        }

        // Convertir array a lista mutable para aplicar las operaciones
        List<UUID> galleryList = new ArrayList<>(Arrays.asList(currentGallery));

        // Aplicar cada operación
        for (var operation : operations) {
            String op = operation.op();
            UUID targetUuid = operation.targetUuid();
            UUID newValue = operation.newValue();

            switch (op) {
                case "replace" -> {
                    if (targetUuid == null) {
                        throw new IllegalArgumentException("targetUuid es requerido para operación 'replace'");
                    }
                    if (newValue == null) {
                        throw new IllegalArgumentException("newValue es requerido para operación 'replace'");
                    }

                    int index = galleryList.indexOf(targetUuid);
                    if (index == -1) {
                        throw new IllegalArgumentException("Imagen no encontrada en la galería: " + targetUuid);
                    }

                    // Eliminar imagen antigua de Supabase (best-effort)
                    safeDeleteFromStorage(targetUuid);

                    // Reemplazar en el mismo índice
                    galleryList.set(index, newValue);
                }
                case "add" -> {
                    if (newValue == null) {
                        throw new IllegalArgumentException("newValue es requerido para operación 'add'");
                    }
                    galleryList.add(newValue);
                }
                case "remove" -> {
                    if (targetUuid == null) {
                        throw new IllegalArgumentException("targetUuid es requerido para operación 'remove'");
                    }

                    boolean removed = galleryList.remove(targetUuid);
                    if (!removed) {
                        throw new IllegalArgumentException("Imagen no encontrada en la galería: " + targetUuid);
                    }

                    // Eliminar de Supabase (best-effort)
                    safeDeleteFromStorage(targetUuid);
                }
                default -> throw new IllegalArgumentException(
                        "Operación no soportada: " + op + ". Operaciones válidas: replace, add, remove");
            }
        }

        // Guardar el array actualizado
        section.setGalleryObjectIds(galleryList.toArray(new UUID[0]));
        Section saved = sectionRepository.save(section);

        // Devolver recurso actualizado (incluye {id,url} en 'gallery')
        Set<UUID> ids = new HashSet<>();
        if (saved.getIconObjectId() != null) ids.add(saved.getIconObjectId());
        if (saved.getPhotoPrincipal() != null) ids.add(saved.getPhotoPrincipal());
        if (saved.getGalleryObjectIds() != null) ids.addAll(Arrays.asList(saved.getGalleryObjectIds()));
        Map<UUID, String> urlMap = getUrlMapFromIds(ids);
        return toResponseDTO(saved, urlMap);
    }

    private Section findSectionOrThrow(String tenantId, String groupSlug, Long sectionId) {
        Group group = getGroup(tenantId, groupSlug);
        return sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
    }

    private Group getGroup(String tenantId, String groupSlug) {
        verifyTenantExists(tenantId);
        return groupRepository.findByTenantIdAndSlug(tenantId, groupSlug)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }

    private void verifyTenantExists(String tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new IllegalArgumentException("Tenant not found with id: " + tenantId);
        }
    }

    private void mapDtoToEntity(SectionDTO dto, Section section) {
        section.setName(dto.name());
        section.setDescription(dto.description());
        section.setIconObjectId(dto.iconObjectId());
        section.setPhotoPrincipal(dto.photoPrincipal());

        // No tocar galería si viene null en el DTO (evita borrarla accidentalmente)
        if (dto.galleryObjectIds() != null) {
            section.setGalleryObjectIds(dto.galleryObjectIds());
        }
        // Si viene null, se deja como está
    }

    // Versión para carga masiva
    SectionResponseDTO toResponseDTO(Section section, Map<UUID, String> urlMap) {
        String iconUrl = urlMap != null ? urlMap.get(section.getIconObjectId()) : null;
        String photoPrincipalUrl = urlMap != null ? urlMap.get(section.getPhotoPrincipal()) : null;

        final UUID[] ids = section.getGalleryObjectIds() != null ? section.getGalleryObjectIds() : new UUID[0];

        // legacy
        List<String> galleryUrls = (urlMap != null)
                ? Arrays.stream(ids).map(urlMap::get).filter(Objects::nonNull).collect(toList())
                : Collections.emptyList();

        // nuevo contrato estable
        List<GalleryItemDTO> gallery = (urlMap != null)
                ? Arrays.stream(ids)
                .map(id -> {
                    String url = urlMap.get(id);
                    return (url != null) ? new GalleryItemDTO(id, url) : null;
                })
                .filter(Objects::nonNull)
                .collect(toList())
                : Collections.emptyList();

        return new SectionResponseDTO(
                section.getSectionId(),
                section.getTenantId(),
                section.getGroupId(),
                section.getName(),
                section.getDescription(),
                section.getIconObjectId(),
                iconUrl,
                section.getPhotoPrincipal(),
                photoPrincipalUrl,
                galleryUrls, // legacy
                gallery,     // nuevo
                section.getCreatedAt(),
                section.getUpdatedAt()
        );
    }

    // Versión para un solo objeto
    private SectionResponseDTO toResponseDTO(Section section) {
        Set<UUID> ids = new HashSet<>();
        if (section.getIconObjectId() != null) {
            ids.add(section.getIconObjectId());
        }
        if (section.getPhotoPrincipal() != null) {
            ids.add(section.getPhotoPrincipal());
        }
        if (section.getGalleryObjectIds() != null) {
            ids.addAll(Arrays.asList(section.getGalleryObjectIds()));
        }

        try {
            System.out.println("[UPLOAD] start → event=fetch_single_section_urls, sectionId=" + section.getSectionId() + 
                             ", imageCount=" + ids.size() + ", service=supabase_storage");
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(ids);
            
            if (urlMap != null && !urlMap.isEmpty()) {
                System.out.println("[UPLOAD] success → event=fetch_single_section_urls, urlsRetrieved=" + urlMap.size());
            }
            
            return toResponseDTO(section, urlMap != null ? urlMap : Collections.emptyMap());
        } catch (Exception e) {
            classifyAndLogSupabaseError(e, "fetch_single_section_urls", null, null, null);
            return toResponseDTO(section, Collections.emptyMap());
        }
    }

    /**
     * Método auxiliar para obtener URLs de forma segura desde el servicio de almacenamiento
     */
    private Map<UUID, String> getUrlMapFromIds(Set<UUID> imageIds) {
        if (imageIds.isEmpty() || storageService == null) {
            return Collections.emptyMap();
        }

        try {
            System.out.println("[UPLOAD] start → event=fetch_urls, imageCount=" + imageIds.size() + ", service=supabase_storage");
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(imageIds);
            
            if (urlMap != null && !urlMap.isEmpty()) {
                System.out.println("[UPLOAD] success → event=fetch_urls, urlsRetrieved=" + urlMap.size() + ", hint=URLs obtenidas correctamente desde Supabase");
            }
            
            return urlMap != null ? urlMap : Collections.emptyMap();
        } catch (Exception e) {
            classifyAndLogSupabaseError(e, "fetch_urls", null, null, null);
            return Collections.emptyMap();
        }
    }

    /**
     * Eliminación best-effort del storage (no rompe la operación si falla el borrado).
     */
    private void safeDeleteFromStorage(UUID objectId) {
        if (storageService == null || objectId == null) return;
        try {
            System.out.println("[UPLOAD] start → event=delete_file, objectId=" + objectId + ", service=supabase_storage");
            storageService.deleteFileByObjectId(objectId);
            System.out.println("[UPLOAD] success → event=delete_file, objectId=" + objectId + ", hint=Archivo eliminado correctamente de Supabase");
        } catch (Exception ex) {
            classifyAndLogSupabaseError(ex, "delete_file", null, objectId, null);
        }
    }

    /**
     * Clasifica y loguea errores de Supabase según la documentación de diagnóstico
     */
    private void classifyAndLogSupabaseError(Exception e, String event, String bucket, UUID objectId, Long fileSize) {
        String errorMessage = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        String exceptionType = e.getClass().getSimpleName();
        
        System.err.println("[UPLOAD] supabase-error → event=" + event + 
                          ", exceptionType=" + exceptionType + 
                          ", message=" + e.getMessage());

        // AUTH (401 / token inválido)
        if (errorMessage.contains("invalid jwt") || errorMessage.contains("unauthorized") || 
            errorMessage.contains("401") || errorMessage.contains("token")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=AUTH → status=401, " +
                             "hint=Sesión expirada o token inválido. ACCIÓN FRONT: Reautenticar/refrescar sesión. " +
                             "ACCIÓN BACK: Verificar flujo de Auth.");
            return;
        }

        // PERMISOS RLS (403 AccessDenied)
        if (errorMessage.contains("403") || errorMessage.contains("access denied") || 
            errorMessage.contains("forbidden") || errorMessage.contains("permission")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=PERMISOS_RLS → status=403, " +
                             "hint=No tienes permiso para esta operación. ACCIÓN BACK/DBA: Crear políticas RLS en storage.objects " +
                             "para INSERT/UPDATE/SELECT en este bucket/path. Los buckets son privados por defecto.");
            return;
        }

        // RUTA/BUCKET (404 NoSuchBucket/NoSuchKey)
        if (errorMessage.contains("404") || errorMessage.contains("not found") || 
            errorMessage.contains("no such bucket") || errorMessage.contains("no such key")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=RUTA_BUCKET → status=404, " +
                             (bucket != null ? "bucket=" + bucket + ", " : "") +
                             (objectId != null ? "objectId=" + objectId + ", " : "") +
                             "hint=Ruta o bucket inválidos. ACCIÓN FRONT: Corrige el path (formato: carpeta/subcarpeta/archivo.ext).");
            return;
        }

        // CONFLICTO (409 ResourceAlreadyExists/KeyAlreadyExists)
        if (errorMessage.contains("409") || errorMessage.contains("already exists") || 
            errorMessage.contains("conflict") || errorMessage.contains("duplicate")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=CONFLICTO → status=409, " +
                             "hint=Ya existe un archivo en ese path. ACCIÓN FRONT: Cambiar nombre o habilitar sobrescritura (upsert).");
            return;
        }

        // TAMAÑO (413 EntityTooLarge)
        if (errorMessage.contains("413") || errorMessage.contains("entity too large") || 
            errorMessage.contains("file too large") || errorMessage.contains("size limit")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=TAMAÑO → status=413, " +
                             (fileSize != null ? "fileSize=" + fileSize + " bytes, " : "") +
                             "hint=Archivo excede límites configurados. ACCIÓN FRONT: Comprimir/recortar; usar resumable para >6 MB. " +
                             "ACCIÓN PROYECTO: Ajustar Global file size limit (Free: max 50 MB, Pro: hasta 500 GB).");
            return;
        }

        // RATE LIMIT / CAPACIDAD (429 / 503 SlowDown / MaxClientsInSessionMode)
        if (errorMessage.contains("429") || errorMessage.contains("too many requests") || 
            errorMessage.contains("rate limit") || errorMessage.contains("503") || 
            errorMessage.contains("slow down") || errorMessage.contains("maxclientsinsessionmode") ||
            errorMessage.contains("max clients reached") || errorMessage.contains("pool_size")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=RATE_LIMIT_CAPACIDAD → status=429/503, " +
                             "hint=Demasiadas solicitudes o límite de conexiones alcanzado (MaxClientsInSessionMode). " +
                             "ACCIÓN FRONT: Backoff exponencial, reducir concurrencia, reintentar en unos segundos. " +
                             "ACCIÓN PROYECTO: Revisar límites/compute del proyecto y pool de conexiones. " +
                             "NOTA: Este NO es un error del frontend, es un límite de capacidad de Supabase.");
            return;
        }

        // RED / CORS (TypeError: Failed to fetch) - aunque en backend es menos común
        if (errorMessage.contains("failed to fetch") || errorMessage.contains("cors") || 
            errorMessage.contains("network") || errorMessage.contains("connection")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=RED_CORS → " +
                             "hint=Problema de red/conectividad con Supabase. ACCIÓN FRONT: Revisar URL, CORS, conectividad. " +
                             "ACCIÓN BACK: Verificar configuración de red y acceso a Supabase.");
            return;
        }

        // SERVIDOR (5xx distintos a 503 SlowDown)
        if (errorMessage.contains("500") || errorMessage.contains("502") || 
            errorMessage.contains("504") || errorMessage.contains("internal server error") ||
            errorMessage.contains("bad gateway") || errorMessage.contains("gateway timeout")) {
            System.err.println("[UPLOAD] supabase-error → CATEGORÍA=SERVIDOR → status=5xx, " +
                             "hint=Problema del servidor de Supabase. ACCIÓN FRONT: Reintentar con backoff corto; si persiste, notificar. " +
                             "ACCIÓN PROYECTO: Verificar estado del servicio y logs de Supabase.");
            return;
        }

        // ERROR GENÉRICO (sin clasificación específica)
        System.err.println("[UPLOAD] supabase-error → CATEGORÍA=GENÉRICO → " +
                         "hint=Error no clasificado de Supabase. Revisar mensaje completo y documentación. " +
                         "Si el problema persiste, contactar soporte.");
    }
}