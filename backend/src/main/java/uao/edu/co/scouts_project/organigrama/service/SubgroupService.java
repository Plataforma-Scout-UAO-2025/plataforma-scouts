package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.model.*;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class SubgroupService {

    private final SubgroupRepository subgroupRepository;
    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;

    public SubgroupService(SubgroupRepository subgroupRepository,
                          SectionRepository sectionRepository,
                          GroupRepository groupRepository,
                          TenantRepository tenantRepository,
                          @Qualifier("organigramaStorageService") SupabaseStorageService storageService) {
        this.subgroupRepository = subgroupRepository;
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<SubgroupResponseDTO> getSubgroupsBySection(String tenantSlug, String groupSlug, Long sectionId) {
        // Validar jerarquía y obtener entidades necesarias de una vez
        Tenant tenant = tenantRepository.findBySlug(tenantSlug).orElseThrow(() -> new RuntimeException("Tenant not found"));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug).orElseThrow(() -> new RuntimeException("Group not found"));
        validateSection(group.getGroupId(), sectionId); // Validar que la sección pertenece al grupo
        
        // 1. Obtener todos los subgrupos en una consulta
        List<Subgroup> subgroups = subgroupRepository.findByTenantIdAndGroupIdAndSectionId(
            tenant.getTenantId(), group.getGroupId(), sectionId);

        // 2. Recolectar TODOS los UUIDs de TODAS las imágenes (fotos principales y galerías)
        // TODO: GALERÍA DE FOTOS - Lógica de galería temporalmente deshabilitada
        Set<UUID> allImageIds = subgroups.stream()
            .flatMap(subgroup -> {
                // Stream<UUID> galleryStream = (subgroup.getGalleryObjectIds() != null) ? Arrays.stream(subgroup.getGalleryObjectIds()) : Stream.empty();
                // return Stream.concat(Stream.of(subgroup.getPhotoPrincipal()), galleryStream);
                return Stream.of(subgroup.getPhotoPrincipal()); // Solo foto principal
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        // 3. UNA SOLA consulta para obtener todas las URLs
        try {
            System.out.println("[UPLOAD] start → event=fetch_subgroups_urls, subgroupCount=" + subgroups.size() + 
                             ", totalImages=" + allImageIds.size() + ", service=supabase_storage");
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(allImageIds);
            
            if (urlMap != null && !urlMap.isEmpty()) {
                System.out.println("[UPLOAD] success → event=fetch_subgroups_urls, urlsRetrieved=" + urlMap.size());
            }
            
            // 4. Construir las respuestas usando el mapa eficiente
            return subgroups.stream()
                    .map(subgroup -> toResponseDTO(subgroup, urlMap))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            classifyAndLogSupabaseError(e, "fetch_subgroups_urls", null, null, null);
            // Si falla, devolver sin URLs
            return subgroups.stream()
                    .map(subgroup -> toResponseDTO(subgroup, Collections.emptyMap()))
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public SubgroupResponseDTO getSubgroupById(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        return toResponseDTO(subgroup);
    }

    public SubgroupResponseDTO createSubgroup(String tenantSlug, String groupSlug, Long sectionId, SubgroupDTO dto) {
        // La validación ahora es más eficiente
        Tenant tenant = tenantRepository.findBySlug(tenantSlug).orElseThrow(() -> new RuntimeException("Tenant not found"));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug).orElseThrow(() -> new RuntimeException("Group not found"));
        validateSection(group.getGroupId(), sectionId);

        if (subgroupRepository.existsBySectionIdAndName(sectionId, dto.name())) {
            throw new RuntimeException("Subgroup name already exists in this section: " + dto.name());
        }

        Subgroup subgroup = new Subgroup();
        subgroup.setTenantId(tenant.getTenantId());
        subgroup.setGroupId(group.getGroupId());
        subgroup.setSectionId(sectionId);
        subgroup.setName(dto.name());
        subgroup.setDescription(dto.description());
        subgroup.setPhotoPrincipal(dto.photoPrincipal());

        // TODO: GALERÍA DE FOTOS - Lógica de galería temporalmente deshabilitada
        /*if (dto.galleryObjectIds() != null) {
            subgroup.setGalleryObjectIds(dto.galleryObjectIds());
        } else {
            subgroup.setGalleryObjectIds(new UUID[0]);
        }*/
        
        subgroup.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        subgroup.setCreatedAt(Instant.now());
        subgroup.setUpdatedAt(Instant.now());

        Subgroup saved = subgroupRepository.save(subgroup);
        return toResponseDTO(saved);
    }

    public SubgroupResponseDTO updateSubgroup(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId, SubgroupDTO dto) {
        Subgroup existing = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);

        if (dto.name() != null && !dto.name().equals(existing.getName())) {
            if (subgroupRepository.existsBySectionIdAndName(sectionId, dto.name())) {
                throw new RuntimeException("Subgroup name already exists in this section: " + dto.name());
            }
            existing.setName(dto.name());
        }
        if (dto.description() != null) {
            existing.setDescription(dto.description());
        }
        if (dto.photoPrincipal() != null && !Objects.equals(dto.photoPrincipal(), existing.getPhotoPrincipal())) {
            safeDeleteFromStorage(existing.getPhotoPrincipal());
            existing.setPhotoPrincipal(dto.photoPrincipal());
        }
        // TODO: GALERÍA DE FOTOS - Lógica de actualización de galería temporalmente deshabilitada
        /*if (dto.galleryObjectIds() != null) {
            UUID[] oldArr = existing.getGalleryObjectIds() != null ? existing.getGalleryObjectIds() : new UUID[0];
            Set<UUID> oldSet = new HashSet<>(Arrays.asList(oldArr));
            Set<UUID> newSet = new HashSet<>(Arrays.asList(dto.galleryObjectIds()));

            if (storageService != null) {
                oldSet.stream()
                    .filter(id -> !newSet.contains(id))
                    .forEach(storageService::deleteFileByObjectId);
            }
            existing.setGalleryObjectIds(newSet.toArray(UUID[]::new));
        }*/

        if (dto.isActive() != null) {
            existing.setIsActive(dto.isActive());
        }
        
        existing.setUpdatedAt(Instant.now());

        Subgroup updated = subgroupRepository.save(existing);
        return toResponseDTO(updated);
    }

    public void deleteSubgroup(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        safeDeleteFromStorage(subgroup.getPhotoPrincipal());
        // TODO: GALERÍA DE FOTOS - Eliminación de galería temporalmente deshabilitada
        /*if (subgroup.getGalleryObjectIds() != null) {
            Arrays.stream(subgroup.getGalleryObjectIds()).forEach(this::safeDeleteFromStorage);
        }*/

        subgroupRepository.delete(subgroup);
    }
    
    // TODO: GALERÍA DE FOTOS - Método temporalmente deshabilitado
    /*@Transactional
    public void deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId, UUID objectId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        UUID[] galleryIds = subgroup.getGalleryObjectIds();
        if (galleryIds == null || galleryIds.length == 0) return;

        List<UUID> galleryIdList = new ArrayList<>(Arrays.asList(galleryIds));
        
        if (galleryIdList.remove(objectId)) {
            storageService.deleteFileByObjectId(objectId);
            subgroup.setGalleryObjectIds(galleryIdList.toArray(new UUID[0]));
            subgroupRepository.save(subgroup);
        }
    }*/

    @Transactional
    public void deletePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        UUID photoPrincipalIdToDelete = subgroup.getPhotoPrincipal();
        if (photoPrincipalIdToDelete != null) {
            safeDeleteFromStorage(photoPrincipalIdToDelete);
            subgroup.setPhotoPrincipal(null);
            subgroupRepository.save(subgroup);
        }
    }
    
    @Transactional
    public void updatePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId, UUID photoObjectId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        // Eliminar foto anterior si existe y es diferente
        if (subgroup.getPhotoPrincipal() != null && !subgroup.getPhotoPrincipal().equals(photoObjectId)) {
            safeDeleteFromStorage(subgroup.getPhotoPrincipal());
        }
        
        subgroup.setPhotoPrincipal(photoObjectId);
        subgroupRepository.save(subgroup);
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
    
    // TODO: GALERÍA DE FOTOS - Método temporalmente deshabilitado
    /*@Transactional
    public void patchGallery(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId,
                            List<uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest.PatchOperation> operations) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        UUID[] currentGallery = subgroup.getGalleryObjectIds();
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
                    // Buscar el índice del UUID objetivo
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
                    
                    // Eliminar imagen antigua de Supabase
                    if (storageService != null) {
                        storageService.deleteFileByObjectId(targetUuid);
                    }
                    
                    // Reemplazar en el mismo índice
                    galleryList.set(index, newValue);
                }
                case "add" -> {
                    // Agregar nueva imagen al final
                    if (newValue == null) {
                        throw new IllegalArgumentException("newValue es requerido para operación 'add'");
                    }
                    galleryList.add(newValue);
                }
                case "remove" -> {
                    // Buscar y eliminar por UUID
                    if (targetUuid == null) {
                        throw new IllegalArgumentException("targetUuid es requerido para operación 'remove'");
                    }
                    
                    boolean removed = galleryList.remove(targetUuid);
                    if (!removed) {
                        throw new IllegalArgumentException("Imagen no encontrada en la galería: " + targetUuid);
                    }
                    
                    // Eliminar de Supabase
                    if (storageService != null) {
                        storageService.deleteFileByObjectId(targetUuid);
                    }
                }
                default -> throw new IllegalArgumentException("Operación no soportada: " + op + ". Operaciones válidas: replace, add, remove");
            }
        }
        
        // Guardar el array actualizado
        subgroup.setGalleryObjectIds(galleryList.toArray(new UUID[0]));
        subgroupRepository.save(subgroup);
    }*/
    
    private Subgroup findSubgroupOrThrow(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        Subgroup subgroup = subgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Subgroup not found with id: " + subgroupId));
        if (!subgroup.getSectionId().equals(sectionId)) {
            throw new RuntimeException("Subgroup does not belong to the specified section");
        }
        return subgroup;
    }

    private void validateHierarchy(String tenantSlug, String groupSlug, Long sectionId) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug).orElseThrow(() -> new RuntimeException("Tenant not found"));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug).orElseThrow(() -> new RuntimeException("Group not found"));
        validateSection(group.getGroupId(), sectionId);
    }

    private void validateSection(Long groupId, Long sectionId) {
        Section section = sectionRepository.findById(sectionId).orElseThrow(() -> new RuntimeException("Section not found"));
        if (!section.getGroupId().equals(groupId)) {
            throw new RuntimeException("Section does not belong to the specified group");
        }
    }

    // Versión para carga masiva
    private SubgroupResponseDTO toResponseDTO(Subgroup subgroup, Map<UUID, String> urlMap) {
        String photoPrincipalUrl = urlMap != null ? urlMap.get(subgroup.getPhotoPrincipal()) : null;
        
        // TODO: GALERÍA DE FOTOS - Lógica de galería temporalmente deshabilitada
        /*List<String> galleryUrls;
        if (subgroup.getGalleryObjectIds() != null && subgroup.getGalleryObjectIds().length > 0) {
            galleryUrls = Arrays.stream(subgroup.getGalleryObjectIds())
                                .map(urlMap::get) // Búsqueda eficiente en el mapa
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        } else {
            galleryUrls = Collections.emptyList();
        }*/

        return new SubgroupResponseDTO(
                subgroup.getSubgroupId(), subgroup.getTenantId(), subgroup.getGroupId(),
                subgroup.getSectionId(), subgroup.getName(), subgroup.getDescription(),
                photoPrincipalUrl, /* galleryUrls, */ subgroup.getIsActive(), subgroup.getCreatedAt(), subgroup.getUpdatedAt()
        );
    }

    // Versión para un solo objeto
    private SubgroupResponseDTO toResponseDTO(Subgroup subgroup) {
        Set<UUID> ids = new HashSet<>();
        if (subgroup.getPhotoPrincipal() != null) {
            ids.add(subgroup.getPhotoPrincipal());
        }
        // TODO: GALERÍA DE FOTOS - Lógica de galería temporalmente deshabilitada
        /*if (subgroup.getGalleryObjectIds() != null) {
            ids.addAll(Arrays.asList(subgroup.getGalleryObjectIds()));
        }*/

        if (ids.isEmpty()) {
            return toResponseDTO(subgroup, Collections.emptyMap());
        }

        try {
            System.out.println("[UPLOAD] start → event=fetch_single_subgroup_urls, subgroupId=" + subgroup.getSubgroupId() + 
                             ", imageCount=" + ids.size() + ", service=supabase_storage");
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(ids);
            
            if (urlMap != null && !urlMap.isEmpty()) {
                System.out.println("[UPLOAD] success → event=fetch_single_subgroup_urls, urlsRetrieved=" + urlMap.size());
            }
            
            return toResponseDTO(subgroup, urlMap);
        } catch (Exception e) {
            classifyAndLogSupabaseError(e, "fetch_single_subgroup_urls", null, null, null);
            return toResponseDTO(subgroup, Collections.emptyMap());
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