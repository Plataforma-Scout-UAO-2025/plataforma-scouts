package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.organigrama.domain.*;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.SubgroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
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
        Set<UUID> allImageIds = subgroups.stream()
            .flatMap(subgroup -> {
                Stream<UUID> galleryStream = (subgroup.getGalleryObjectIds() != null) ? Arrays.stream(subgroup.getGalleryObjectIds()) : Stream.empty();
                return Stream.concat(Stream.of(subgroup.getPhotoPrincipal()), galleryStream);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        // 3. UNA SOLA consulta para obtener todas las URLs
        Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(allImageIds);

        // 4. Construir las respuestas usando el mapa eficiente
        return subgroups.stream()
                .map(subgroup -> toResponseDTO(subgroup, urlMap))
                .collect(Collectors.toList());
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

        if (dto.galleryObjectIds() != null) {
            subgroup.setGalleryObjectIds(dto.galleryObjectIds());
        } else {
            subgroup.setGalleryObjectIds(new UUID[0]);
        }
        
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
            storageService.deleteFileByObjectId(existing.getPhotoPrincipal());
            existing.setPhotoPrincipal(dto.photoPrincipal());
        }
        if (dto.galleryObjectIds() != null) {
            UUID[] oldArr = existing.getGalleryObjectIds() != null ? existing.getGalleryObjectIds() : new UUID[0];
            Set<UUID> oldSet = new HashSet<>(Arrays.asList(oldArr));
            Set<UUID> newSet = new HashSet<>(Arrays.asList(dto.galleryObjectIds()));

            if (storageService != null) {
                oldSet.stream()
                    .filter(id -> !newSet.contains(id))
                    .forEach(storageService::deleteFileByObjectId);
            }
            existing.setGalleryObjectIds(newSet.toArray(UUID[]::new));
        }

        if (dto.isActive() != null) {
            existing.setIsActive(dto.isActive());
        }
        
        existing.setUpdatedAt(Instant.now());

        Subgroup updated = subgroupRepository.save(existing);
        return toResponseDTO(updated);
    }

    public void deleteSubgroup(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        storageService.deleteFileByObjectId(subgroup.getPhotoPrincipal());
        if (subgroup.getGalleryObjectIds() != null) {
            Arrays.stream(subgroup.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
        }

        subgroupRepository.delete(subgroup);
    }
    
    @Transactional
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
    }

    @Transactional
    public void deletePhotoPrincipal(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        UUID photoPrincipalIdToDelete = subgroup.getPhotoPrincipal();
        if (photoPrincipalIdToDelete != null) {
            storageService.deleteFileByObjectId(photoPrincipalIdToDelete);
            subgroup.setPhotoPrincipal(null);
            subgroupRepository.save(subgroup);
        }
    }
    
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
        
        List<String> galleryUrls;
        if (subgroup.getGalleryObjectIds() != null && subgroup.getGalleryObjectIds().length > 0) {
            galleryUrls = Arrays.stream(subgroup.getGalleryObjectIds())
                                .map(urlMap::get) // Búsqueda eficiente en el mapa
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        } else {
            galleryUrls = Collections.emptyList();
        }

        return new SubgroupResponseDTO(
                subgroup.getSubgroupId(), subgroup.getTenantId(), subgroup.getGroupId(),
                subgroup.getSectionId(), subgroup.getName(), subgroup.getDescription(),
                photoPrincipalUrl, galleryUrls, subgroup.getIsActive(), subgroup.getCreatedAt(), subgroup.getUpdatedAt()
        );
    }

    // Versión para un solo objeto
    private SubgroupResponseDTO toResponseDTO(Subgroup subgroup) {
        Set<UUID> ids = new HashSet<>();
        if (subgroup.getPhotoPrincipal() != null) {
            ids.add(subgroup.getPhotoPrincipal());
        }
        if (subgroup.getGalleryObjectIds() != null) {
            ids.addAll(Arrays.asList(subgroup.getGalleryObjectIds()));
        }

        if (ids.isEmpty()) {
            return toResponseDTO(subgroup, Collections.emptyMap());
        }

        Map<UUID, String> urlMap = storageService.getPublicUrlsFromObjectIds(ids);
        return toResponseDTO(subgroup, urlMap);
    }
}