package uao.edu.co.scouts_project.organigrama.service;

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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

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
                          SupabaseStorageService storageService) {
        this.subgroupRepository = subgroupRepository;
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<SubgroupResponseDTO> getSubgroupsBySection(String tenantSlug, String groupSlug, Long sectionId) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantSlug));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupSlug));
        
        List<Subgroup> subgroups = subgroupRepository.findByTenantIdAndGroupIdAndSectionId(
            tenant.getTenantId(), group.getGroupId(), sectionId);
        return subgroups.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubgroupResponseDTO getSubgroupById(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        return toResponseDTO(subgroup);
    }

    public SubgroupResponseDTO createSubgroup(String tenantSlug, String groupSlug, Long sectionId, SubgroupDTO dto) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        Tenant tenant = tenantRepository.findBySlug(tenantSlug).orElseThrow(() -> new RuntimeException("Tenant not found"));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug).orElseThrow(() -> new RuntimeException("Group not found"));

        if (subgroupRepository.existsBySectionIdAndName(sectionId, dto.name())) {
            throw new RuntimeException("Subgroup name already exists in this section: " + dto.name());
        }

        Subgroup subgroup = new Subgroup();
        subgroup.setTenantId(tenant.getTenantId());
        subgroup.setGroupId(group.getGroupId());
        subgroup.setSectionId(sectionId);
        subgroup.setName(dto.name());
        subgroup.setDescription(dto.description());

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
        if (dto.galleryObjectIds() != null) {
            if (existing.getGalleryObjectIds() != null) {
                Arrays.stream(existing.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
            }
            existing.setGalleryObjectIds(dto.galleryObjectIds());
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
        
        if (subgroup.getGalleryObjectIds() != null) {
            Arrays.stream(subgroup.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
        }

        subgroupRepository.delete(subgroup);
    }
    
    /**
     * Elimina UNA imagen específica de la galería de un subgrupo por su UUID.
     * @param objectId UUID de la imagen a eliminar
     */
    @Transactional
    public void deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId, UUID objectId) {
        Subgroup subgroup = findSubgroupOrThrow(tenantSlug, groupSlug, sectionId, subgroupId);
        
        UUID[] galleryIds = subgroup.getGalleryObjectIds();
        if (galleryIds == null || galleryIds.length == 0) {
            return; // No hay nada que hacer
        }

        // Convertir el array a una lista mutable para poder eliminar elementos
        List<UUID> galleryIdList = new ArrayList<>(Arrays.asList(galleryIds));
        
        // Si la imagen a eliminar está en la lista y se elimina con éxito
        if (galleryIdList.remove(objectId)) {
            // Eliminar el archivo físico de Supabase
            storageService.deleteFileByObjectId(objectId);
            
            // Actualizar la entidad con el nuevo array (ya sin el elemento eliminado)
            subgroup.setGalleryObjectIds(galleryIdList.toArray(new UUID[0]));
            subgroupRepository.save(subgroup);
        }
    }

    // ============== MÉTODOS PRIVADOS AUXILIARES ==============
    
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
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantSlug));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupSlug));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + sectionId));
        
        if (!section.getGroupId().equals(group.getGroupId())) {
            throw new RuntimeException("Section does not belong to the specified group");
        }
    }

    private SubgroupResponseDTO toResponseDTO(Subgroup subgroup) {
        List<String> galleryUrls;
        if (subgroup.getGalleryObjectIds() != null && subgroup.getGalleryObjectIds().length > 0) {
            galleryUrls = Arrays.stream(subgroup.getGalleryObjectIds())
                                .map(storageService::getPublicUrlFromObjectId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        } else {
            galleryUrls = Collections.emptyList();
        }

        return new SubgroupResponseDTO(
                subgroup.getSubgroupId(),
                subgroup.getTenantId(),
                subgroup.getGroupId(),
                subgroup.getSectionId(),
                subgroup.getName(),
                subgroup.getDescription(),
                galleryUrls,
                subgroup.getIsActive(),
                subgroup.getCreatedAt(),
                subgroup.getUpdatedAt()
        );
    }
}