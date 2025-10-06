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
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.UUID;
import java.time.Instant;

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
    public List<SectionResponseDTO> getSectionsByGroup(String tenantSlug, String groupSlug) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
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
    public SectionResponseDTO getSectionById(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        return toResponseDTO(section);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSectionWithSubgroups(String tenantSlug, String groupSlug, Long sectionId) {
        SectionResponseDTO section = getSectionById(tenantSlug, groupSlug, sectionId);
        List<SubgroupResponseDTO> subgroups = subgroupService.getSubgroupsBySection(tenantSlug, groupSlug, sectionId);
        return Map.of(
                "section", section,
                "subgroups", subgroups
        );
    }

    @Transactional
    public SectionResponseDTO createSection(String tenantSlug, String groupSlug, SectionDTO dto) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        if (sectionRepository.existsByGroupIdAndName(group.getGroupId(), dto.name())) {
            throw new IllegalArgumentException("Section with name '" + dto.name() + "' already exists in this group");
        }
        Section section = new Section(group.getTenantId(), group.getGroupId(), dto.name());
        mapDtoToEntity(dto, section);
        Section saved = sectionRepository.save(section);
        return toResponseDTO(saved);
    }

    @Transactional
    public SectionResponseDTO updateSection(String tenantSlug, String groupSlug, Long sectionId, SectionDTO dto) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void deleteSection(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void deleteIconImage(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

        UUID iconIdToDelete = section.getIconObjectId();
        if (iconIdToDelete != null && storageService != null) {
            safeDeleteFromStorage(iconIdToDelete);
            section.setIconObjectId(null);
            sectionRepository.save(section);
        }
    }

    @Transactional
    public void deletePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId, UUID objectId) {
        deleteGalleryImageById(tenantSlug, groupSlug, sectionId, objectId, true);
    }

    /**
     * Nuevo método compatible que devuelve el recurso actualizado y permite controlar si se borra del storage.
     */
    @Transactional
    public SectionResponseDTO deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId,
                                                     UUID objectId, boolean deleteFromStorage) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void updateIcon(String tenantSlug, String groupSlug, Long sectionId, UUID iconObjectId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void updatePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId, UUID photoObjectId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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
    public void patchGallery(String tenantSlug, String groupSlug, Long sectionId,
                             List<uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest.PatchOperation> operations) {
        // delega a la versión que retorna DTO; se ignora el resultado para compatibilidad
        patchGalleryAndReturn(tenantSlug, groupSlug, sectionId, operations);
    }

    /**
     * Nuevo método que aplica operaciones de galería y devuelve el recurso actualizado.
     * Mantiene la lógica existente (delete en replace/remove) y evita parseos ambiguos (UUID tipado).
     */
    @Transactional
    public SectionResponseDTO patchGalleryAndReturn(String tenantSlug, String groupSlug, Long sectionId,
            List<uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest.PatchOperation> operations) {

        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);

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

    private Section findSectionOrThrow(String tenantSlug, String groupSlug, Long sectionId) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        return sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
    }

    private Group getGroupBySlug(String tenantSlug, String groupSlug) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + tenantSlug));
        return groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
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
                iconUrl,
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
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(ids);
            return toResponseDTO(section, urlMap != null ? urlMap : Collections.emptyMap());
        } catch (Exception e) {
            System.err.println("Error obteniendo URLs del servicio de almacenamiento: " + e.getMessage());
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
            Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(imageIds);
            return urlMap != null ? urlMap : Collections.emptyMap();
        } catch (Exception e) {
            System.err.println("Error obteniendo URLs del servicio de almacenamiento: " + e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Eliminación best-effort del storage (no rompe la operación si falla el borrado).
     */
    private void safeDeleteFromStorage(UUID objectId) {
        if (storageService == null || objectId == null) return;
        try {
            storageService.deleteFileByObjectId(objectId);
        } catch (Exception ex) {
            System.err.println("No se pudo eliminar objeto de storage " + objectId + ": " + ex.getMessage());
        }
    }
}
