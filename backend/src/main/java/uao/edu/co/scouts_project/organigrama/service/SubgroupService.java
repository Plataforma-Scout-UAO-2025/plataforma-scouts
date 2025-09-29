package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.SubgroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubgroupService {

    private final SubgroupRepository subgroupRepository;
    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;

    public SubgroupService(SubgroupRepository subgroupRepository,
                          SectionRepository sectionRepository,
                          GroupRepository groupRepository,
                          TenantRepository tenantRepository) {
        this.subgroupRepository = subgroupRepository;
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<SubgroupDTO> getSubgroupsBySection(String tenantSlug, String groupSlug, Long sectionId) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        
        // Get tenant and group IDs for the repository call
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantSlug));
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupSlug));
        
        List<Subgroup> subgroups = subgroupRepository.findByTenantIdAndGroupIdAndSectionId(
            tenant.getTenantId(), group.getGroupId(), sectionId);
        return subgroups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubgroupDTO getSubgroupById(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        
        Subgroup subgroup = subgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Subgroup not found with id: " + subgroupId));
        
        // Validar que el subgrupo pertenece a la sección correcta
        if (!subgroup.getSectionId().equals(sectionId)) {
            throw new RuntimeException("Subgroup does not belong to the specified section");
        }
        
        return convertToDTO(subgroup);
    }

    public SubgroupDTO createSubgroup(String tenantSlug, String groupSlug, Long sectionId, SubgroupDTO dto) {
        // Validar jerarquía y obtener entidades necesarias
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantSlug));
        
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupSlug));
        
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + sectionId));
        
        // Validar que la sección pertenece al grupo correcto
        if (!section.getGroupId().equals(group.getGroupId())) {
            throw new RuntimeException("Section does not belong to the specified group");
        }

        // Validar unicidad del nombre en la sección
        if (subgroupRepository.existsBySectionIdAndName(sectionId, dto.name())) {
            throw new RuntimeException("Subgroup name already exists in this section: " + dto.name());
        }

        // Crear nueva entidad
        Subgroup subgroup = new Subgroup();
        subgroup.setTenantId(tenant.getTenantId());
        subgroup.setGroupId(group.getGroupId());
        subgroup.setSectionId(sectionId);
        subgroup.setName(dto.name());
        subgroup.setDescription(dto.description());

        // Manejar galería de imágenes
        if (dto.galleryObjectIds() != null) {
            subgroup.setGalleryObjectIds(dto.galleryObjectIds());
        } else {
            subgroup.setGalleryObjectIds(new UUID[0]);
        }
        
        subgroup.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        subgroup.setCreatedAt(Instant.now());
        subgroup.setUpdatedAt(Instant.now());

        Subgroup saved = subgroupRepository.save(subgroup);
        return convertToDTO(saved);
    }

    public SubgroupDTO updateSubgroup(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId, SubgroupDTO dto) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        
        Subgroup existing = subgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Subgroup not found with id: " + subgroupId));
        
        // Validar que el subgrupo pertenece a la sección correcta
        if (!existing.getSectionId().equals(sectionId)) {
            throw new RuntimeException("Subgroup does not belong to the specified section");
        }

        // Validar unicidad del nombre si cambió
        if (dto.name() != null && !dto.name().equals(existing.getName())) {
            if (subgroupRepository.existsBySectionIdAndName(sectionId, dto.name())) {
                throw new RuntimeException("Subgroup name already exists in this section: " + dto.name());
            }
            existing.setName(dto.name());
        }

        // Actualizar campos
        if (dto.description() != null) {
            existing.setDescription(dto.description());
        }

        if (dto.galleryObjectIds() != null) {
            existing.setGalleryObjectIds(dto.galleryObjectIds());
        }
        
        if (dto.isActive() != null) {
            existing.setIsActive(dto.isActive());
        }
        
        existing.setUpdatedAt(Instant.now());

        Subgroup updated = subgroupRepository.save(existing);
        return convertToDTO(updated);
    }

    public void deleteSubgroup(String tenantSlug, String groupSlug, Long sectionId, Long subgroupId) {
        validateHierarchy(tenantSlug, groupSlug, sectionId);
        
        Subgroup subgroup = subgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Subgroup not found with id: " + subgroupId));
        
        // Validar que el subgrupo pertenece a la sección correcta
        if (!subgroup.getSectionId().equals(sectionId)) {
            throw new RuntimeException("Subgroup does not belong to the specified section");
        }

        subgroupRepository.delete(subgroup);
    }

    private void validateHierarchy(String tenantSlug, String groupSlug, Long sectionId) {
        // Validar que el tenant existe
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantSlug));
        
        // Validar que el grupo existe y pertenece al tenant
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupSlug));
        
        // Validar que la sección existe y pertenece al grupo
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + sectionId));
        
        if (!section.getGroupId().equals(group.getGroupId())) {
            throw new RuntimeException("Section does not belong to the specified group");
        }
    }

    private SubgroupDTO convertToDTO(Subgroup subgroup) {
        return new SubgroupDTO(
                subgroup.getSubgroupId(),
                subgroup.getTenantId(),
                subgroup.getGroupId(),
                subgroup.getSectionId(),
                subgroup.getName(),
                subgroup.getDescription(),
                subgroup.getGalleryObjectIds(),
                subgroup.getIsActive(),
                subgroup.getCreatedAt(),
                subgroup.getUpdatedAt()
        );
    }
}