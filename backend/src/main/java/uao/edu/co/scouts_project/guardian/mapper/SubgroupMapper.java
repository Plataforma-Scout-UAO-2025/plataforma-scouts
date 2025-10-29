package uao.edu.co.scouts_project.guardian.mapper;

import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;

public class SubgroupMapper {

    /**
     * Convert Subgroup entity to SubgroupDTO
     * 
     * @param entity the Subgroup entity
     * @return SubgroupDTO with basic subgroup information
     */
    public static SubgroupDTO toDTO(Subgroup entity) {
        if (entity == null) {
            return null;
        }

        return SubgroupDTO.builder()
                .subgroupId(entity.getSubgroupId())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    /**
     * Convert SubgroupDTO to Subgroup entity
     * Note: This creates a partial entity with only the fields from DTO
     * Additional fields like tenantId, groupId, etc. should be set separately
     * 
     * @param dto the SubgroupDTO
     * @return Subgroup entity
     */
    public static Subgroup toEntity(SubgroupDTO dto) {
        if (dto == null) {
            return null;
        }

        return Subgroup.builder()
                .subgroupId(dto.getSubgroupId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }
}
