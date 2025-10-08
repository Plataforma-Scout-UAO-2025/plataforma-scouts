package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO; // ✅ Cambia a SubgroupDTO (mayúsculas)

public class SubGroupMapper {

    public static SubgroupDTO toDto(Subgroup subgroup) {
        if (subgroup == null) return null;

        return new SubgroupDTO(
                subgroup.getSubgroupId(),
                subgroup.getTenantId(),
                subgroup.getGroupId(),
                subgroup.getSectionId(),
                subgroup.getName(),
                subgroup.getDescription(),
                subgroup.getPhotoPrincipal(),
                subgroup.getGalleryObjectIds(),
                subgroup.getIsActive(),
                subgroup.getCreatedAt(),
                subgroup.getUpdatedAt()
        );
    }

    public static Subgroup toEntity(SubgroupDTO dto) {
        if (dto == null) return null;

        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(dto.subgroupId());
        subgroup.setTenantId(dto.tenantId());
        subgroup.setGroupId(dto.groupId());
        subgroup.setSectionId(dto.sectionId());
        subgroup.setName(dto.name());
        subgroup.setDescription(dto.description());
        subgroup.setPhotoPrincipal(dto.photoPrincipal());
        subgroup.setIsActive(dto.isActive());

        return subgroup;
    }
}