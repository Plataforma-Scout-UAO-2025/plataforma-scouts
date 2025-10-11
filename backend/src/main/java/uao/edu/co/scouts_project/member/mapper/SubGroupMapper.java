package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;

/**
 * Mapper responsable de convertir entre la entidad Subgroup y su DTO SubgroupDTO.
 * Facilita la transformación de datos entre las capas de dominio y presentación.
 */
public class SubGroupMapper {

    /**
     * Convierte una entidad Subgroup a un DTO SubgroupDTO.
     *
     * @param subgroup Entidad Subgroup a convertir.
     * @return DTO con la información del subgrupo.
     */
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
                subgroup.getIsActive(),
                subgroup.getCreatedAt(),
                subgroup.getUpdatedAt()
        );
    }

    /**
     * Convierte un DTO SubgroupDTO a una entidad Subgroup.
     *
     * @param dto DTO con los datos del subgrupo.
     * @return Entidad Subgroup lista para persistir en la base de datos.
     */
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