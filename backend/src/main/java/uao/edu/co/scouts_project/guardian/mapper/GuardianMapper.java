package uao.edu.co.scouts_project.guardian.mapper;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.member.model.Member;


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
                .role(dto.getRol())
                .build();
    }

    // Convert Member entity to GuardianWithMemberDTO usually for returning guardian info with members they are in charge of (TODO: this have to be implemented in the service layer)
    public static GuardianWithMembersDTO toDTO(Member entity, List<MemberDTO> membersInCharge) {
        return GuardianWithMembersDTO.builder()
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
                .members(membersInCharge) // TODO: We need to create a domain model in our entity so it bring us a list of members based on guardianId, in other words, the member a guardian is taking care of, then we map it to List <MemberDTO>
                .build();
    }

    public static GuardianCreateDTO toGuardianCreateDTO(Member member) {
        return GuardianCreateDTO.builder()
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .identification(member.getIdentification())
                .documentType(member.getDocumentType())
                .phone(member.getPhone())
                .isActive(member.getIsActive())
                .relationship(member.getRelationship())
                .status(member.getStatus())
                .acceptanceDate(member.getAcceptanceDate())
                .rol(member.getRole()) // Assuming a single role for simplicity
                .build();
    }

    public static GuardianCreateDTO toGuardianDTO(Member member) {
        return GuardianCreateDTO.builder()
                .memberId(member.getMemberId())
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .identification(member.getIdentification())
                .documentType(member.getDocumentType())
                .phone(member.getPhone())
                .isActive(member.getIsActive())
                .relationship(member.getRelationship())
                .status(member.getStatus())
                .address(member.getAddress())
                .acceptanceDate(member.getAcceptanceDate())
                .rol(member.getRole()) // Assuming a single role for simplicity
                .build();
    }

    public static MemberDTO toMemberDTO(Member member) {
        return MemberDTO.builder()
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .gender(member.getGender())
                .phone(member.getPhone())
                .birthDate(member.getBirthDate())
                .role(member.getRole())
                .build();
    }

    public static MemberDTO toMemberDTO(MemberCustom memberCustom) {
        return MemberDTO.builder()
                .memberId(memberCustom.getMemberId())
                .firstName(memberCustom.getFirstName())
                .lastName(memberCustom.getLastName())
                .gender(memberCustom.getGender())
                .phone(memberCustom.getPhone())
                .birthDate(memberCustom.getBirthDate())
                .address(memberCustom.getAddress())
                .build();
    }
}