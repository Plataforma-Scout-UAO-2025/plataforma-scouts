package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SectionService {
    
    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;

    public SectionService(SectionRepository sectionRepository, GroupRepository groupRepository, 
                          TenantRepository tenantRepository, 
                          @Qualifier("organigramaStorageService") SupabaseStorageService storageService) {
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
    }
    
    @Transactional(readOnly = true)
    public List<SectionResponseDTO> getSectionsByGroup(String tenantSlug, String groupSlug) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        // 1. Obtener todas las secciones en una consulta
        List<Section> sections = sectionRepository.findByTenantIdAndGroupId(group.getTenantId(), group.getGroupId());

        // 2. Recolectar TODOS los UUIDs de todas las imágenes (íconos, fotos principales y galerías)
        Set<UUID> allImageIds = sections.stream()
            .flatMap(section -> {
                Stream<UUID> galleryStream = (section.getGalleryObjectIds() != null) ? Arrays.stream(section.getGalleryObjectIds()) : Stream.empty();
                return Stream.of(Stream.of(section.getIconObjectId()), 
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
                if (storageService != null) {
                    oldSet.stream()
                        .filter(id -> !newSet.contains(id))
                        .forEach(storageService::deleteFileByObjectId);
                }

                // Actualizar a la lista nueva (conservará los IDs no eliminados)
                section.setGalleryObjectIds(newSet.toArray(UUID[]::new));
            }
            else {
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
            storageService.deleteFileByObjectId(section.getIconObjectId());
            storageService.deleteFileByObjectId(section.getPhotoPrincipal());
            if (section.getGalleryObjectIds() != null) {
                Arrays.stream(section.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
            }
        }
        
        sectionRepository.delete(section);
    }
    
    @Transactional
    public void deleteIconImage(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        UUID iconIdToDelete = section.getIconObjectId();
        if (iconIdToDelete != null && storageService != null) {
            storageService.deleteFileByObjectId(iconIdToDelete);
            section.setIconObjectId(null);
            sectionRepository.save(section);
        }
    }

    @Transactional
    public void deletePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        UUID photoPrincipalIdToDelete = section.getPhotoPrincipal();
        if (photoPrincipalIdToDelete != null && storageService != null) {
            storageService.deleteFileByObjectId(photoPrincipalIdToDelete);
            section.setPhotoPrincipal(null);
            sectionRepository.save(section);
        }
    }

    @Transactional
    public void deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId, UUID objectId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        UUID[] galleryIds = section.getGalleryObjectIds();
        if (galleryIds == null || galleryIds.length == 0) return;

        List<UUID> galleryIdList = new ArrayList<>(Arrays.asList(galleryIds));
        
        if (galleryIdList.remove(objectId)) {
            if (storageService != null) {
                storageService.deleteFileByObjectId(objectId);
            }
            section.setGalleryObjectIds(galleryIdList.toArray(new UUID[0]));
            sectionRepository.save(section);
        }
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
        
        // Convertir List<UUID> a UUID[]
        if (dto.galleryObjectIds() != null) {
        section.setGalleryObjectIds(dto.galleryObjectIds());
        } else {
            section.setGalleryObjectIds(new UUID[0]);
        }
    }
    
    // Versión para carga masiva
    private SectionResponseDTO toResponseDTO(Section section, Map<UUID, String> urlMap) {
        String iconUrl = urlMap != null ? urlMap.get(section.getIconObjectId()) : null;
        String photoPrincipalUrl = urlMap != null ? urlMap.get(section.getPhotoPrincipal()) : null;
        
        List<String> galleryUrls;
        if (section.getGalleryObjectIds() != null && section.getGalleryObjectIds().length > 0 && urlMap != null) {
            galleryUrls = Arrays.stream(section.getGalleryObjectIds())
                                .map(urlMap::get) // Búsqueda eficiente en el mapa
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        } else {
            galleryUrls = Collections.emptyList();
        }

        return new SectionResponseDTO(
            section.getSectionId(), section.getTenantId(), section.getGroupId(), section.getName(),
            section.getDescription(), iconUrl, photoPrincipalUrl, galleryUrls,
            section.getCreatedAt(), section.getUpdatedAt()
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
}