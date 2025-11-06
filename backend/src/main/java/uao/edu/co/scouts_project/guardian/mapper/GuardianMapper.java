package uao.edu.co.scouts_project.guardian.mapper;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianMapper {

        // Convert GuardianCreateDTO to Member entity usually for creating a new
        // guardian
        public static Member toEntity(GuardianCreateDTO dto) {
                return Member.builder()
                                .userId(dto.getUserId())
                                .tenantId(dto.getTenantId())
                                .subgroup(null)
                                .firstName(dto.getFirstName())
                                .lastName(dto.getLastName())
                                .birthDate(dto.getBirthDate())
                                .identification(dto.getIdentification())
                                .documentType(dto.getDocumentType())
                                .gender(dto.getGender())
                                .address(dto.getAddress())
                                .phone(dto.getPhone())
                                .acceptTreatment(true)
                                .isActive(false)
                                .status(Status.PENDING)
                                .role(Role.ACUDIENTE.toString())
                                .build();
        }

        // Convert Member entity to GuardianWithMemberDTO usually for returning guardian
        // info with members they are in charge of
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
                                .birthDate(entity.getBirthDate())
                                .identification(entity.getIdentification())
                                .documentType(entity.getDocumentType())
                                .gender(entity.getGender())
                                .address(entity.getAddress())
                                .phone(entity.getPhone())
                                .isActive(entity.getIsActive())
                                .relationship(entity.getRelationship())
                                .status(entity.getStatus())
                                .acceptanceDate(entity.getAcceptanceDate())
                                .members(membersInCharge)
                                .build();
        }

        public static GuardianCreateDTO toGuardianCreateDTO(Member member) {
                return GuardianCreateDTO.builder()
                                .userId(member.getUserId())
                                .tenantId(member.getTenantId())
                                .firstName(member.getFirstName())
                                .lastName(member.getLastName())
                                .birthDate(member.getBirthDate())
                                .identification(member.getIdentification())
                                .documentType(member.getDocumentType())
                                .phone(member.getPhone())
                                .gender(member.getGender())
                                .address(member.getAddress())
                                .isActive(member.getIsActive())
                                .status(member.getStatus())
                                .acceptanceDate(member.getAcceptanceDate())
                                .role(member.getRole())
                                .build();
        }

        public static GuardianCreateDTO toGuardianDTO(Member member) {
                return GuardianCreateDTO.builder()
                                .memberId(member.getMemberId())
                                .userId(member.getUserId())
                                .tenantId(member.getTenantId())
                                .firstName(member.getFirstName())
                                .lastName(member.getLastName())
                                .birthDate(member.getBirthDate())
                                .identification(member.getIdentification())
                                .documentType(member.getDocumentType())
                                .phone(member.getPhone())
                                .gender(member.getGender())
                                .address(member.getAddress())
                                .isActive(member.getIsActive())
                                .status(member.getStatus())
                                .acceptanceDate(member.getAcceptanceDate())
                                .role(member.getRole())
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
                                .address(member.getAddress())
                                .role(member.getRole())
                                .isActive(member.getIsActive())
                                .build();
        }

        public static MemberDTO toMemberDTO(MemberCustom memberCustom) {
                return MemberDTO.builder()
                                .memberId(memberCustom.getMemberId())
                                .firstName(memberCustom.getFirstName())
                                .lastName(memberCustom.getLastName())
                                .identification(memberCustom.getIdentification())
                                .documentType(memberCustom.getDocumentType())
                                .email(memberCustom.getEmail())
                                .role(memberCustom.getRole())
                                .gender(memberCustom.getGender())
                                .phone(memberCustom.getPhone())
                                .birthDate(memberCustom.getBirthDate())
                                .address(memberCustom.getAddress())
                                .isActive(memberCustom.getIsActive())
                                .relationship(memberCustom.getRelationship())
                                .build();
        }
}