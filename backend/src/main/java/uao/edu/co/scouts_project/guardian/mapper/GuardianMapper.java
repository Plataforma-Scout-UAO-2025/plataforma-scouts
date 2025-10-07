package uao.edu.co.scouts_project.guardian.mapper;

import com.fasterxml.jackson.annotation.JsonInclude;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWIthMemberDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.guardian.model.Member;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianMapper {

    // Convert GuardianCreateDTO to Member entity usually for creating a new guardian
    public static Member toEntity(GuardianCreateDTO dto) {
        return Member.builder()
                .userId(dto.getUserId())
                .tenantId(dto.getTenantId())
                .subgroup(null)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .age(dto.getAge())
                .identification(dto.getIdentification())
                .documentType(dto.getDocumentType())
                .phone(dto.getPhone())
                .isActive(dto.getIsActive())
                .relationship(dto.getRelationship())
                .status(dto.getStatus())
                .acceptanceDate(dto.getAcceptanceDate())
                .role(dto.getRoles().get(0))
                .build();
    }

    // Convert Member entity to GuardianWithMemberDTO usually for returning guardian info with members they are in charge of (TODO: this have to be implemented in the service layer)
    public static GuardianWithMemberDTO toDTO(Member entity) {
        return GuardianWithMemberDTO.builder()
                .userId(entity.getUserId())
                .tenantId(entity.getTenantId())
                .subgroup(SubgroupDTO.builder()
                        .subgroupId(entity.getSubgroup().getSubgroupId())
                        .name(entity.getSubgroup().getName())
                        .build())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .age(entity.getAge())
                .identification(entity.getIdentification())
                .documentType(entity.getDocumentType())
                .phone(entity.getPhone())
                .isActive(entity.getIsActive())
                .relationship(entity.getRelationship())
                .status(entity.getStatus())
                .acceptanceDate(entity.getAcceptanceDate())
                .members() // TODO: We need to create a domain model in our entity so it bring us a list of members based on guardianId, in other words, the member a guardian is taking care of, then we map it to List <MemberDTO>
                .build();
    }
    
}