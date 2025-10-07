package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.member.dto.MemberDto;
import uao.edu.co.scouts_project.member.model.Member;
//import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.stream.Collectors;

public class MemberMapper {

    public static MemberDto toDto(Member member) {
        if (member == null) return null;

        return MemberDto.builder()
                .memberId(member.getMemberId())
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .guardianId(member.getGuardianId())
                .subgroup(member.getSubgroup() != null ? member.getSubgroup() : null)
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .role(member.getRole())
                .identification(member.getIdentification())
                .documentType(member.getDocumentType() != null ? member.getDocumentType().name() : null)
                .email(member.getEmail())
                .gender(member.getGender())
                .birthDate(member.getBirthDate())
                .address(member.getAddress())
                .phone(member.getPhone())
                .weight(member.getWeight())
                .height(member.getHeight())
                .hobbies(member.getHobbies())
                .sports(member.getSports())
                .instruments(member.getInstruments())
                .isActive(member.getIsActive())
                .relationship(member.getRelationship())
                .status(member.getStatus() != null ? member.getStatus().name() : null)
                .acceptanceDate(member.getAcceptanceDate())
                .emergencyContacts(
                        member.getEmergencyContacts() != null
                                ? member.getEmergencyContacts().stream()
                                .map(ec -> MemberDto.EmergencyContactDto.builder()
                                        .name(ec.getName())
                                        .relationship(ec.getRelationship())
                                        .phone(ec.getPhone())
                                        .build())
                                .collect(Collectors.toList())
                                : null
                )
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }

    public static Member toEntity(MemberDto dto) {
        if (dto == null) return null;

        Member member = new Member();

        member.setMemberId(dto.getMemberId());
        member.setUserId(dto.getUserId());
        member.setTenantId(dto.getTenantId());
        member.setGuardianId(dto.getGuardianId());
        if (dto.getSubgroup() != null) {
            member.setSubgroup(dto.getSubgroup());
        }
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setAge(dto.getAge());
        member.setRole(dto.getRole());
        member.setIdentification(dto.getIdentification());

        if (dto.getDocumentType() != null) {
            member.setDocumentType(DocumentType.valueOf(dto.getDocumentType()));
        }

        member.setEmail(dto.getEmail());
        member.setGender(dto.getGender());
        member.setBirthDate(dto.getBirthDate());
        member.setAddress(dto.getAddress());
        member.setPhone(dto.getPhone());
        member.setWeight(dto.getWeight());
        member.setHeight(dto.getHeight());
        member.setHobbies(dto.getHobbies());
        member.setSports(dto.getSports());
        member.setInstruments(dto.getInstruments());
        member.setIsActive(dto.getIsActive());
        member.setRelationship(dto.getRelationship());

        if (dto.getStatus() != null) {
            member.setStatus(Status.valueOf(dto.getStatus()));
        }

        member.setAcceptanceDate(dto.getAcceptanceDate());

        if (dto.getEmergencyContacts() != null) {
            member.setEmergencyContacts(
                    dto.getEmergencyContacts().stream()
                            .map(ecDto -> Member.EmergencyContact.builder()
                                    .name(ecDto.getName())
                                    .relationship(ecDto.getRelationship())
                                    .phone(ecDto.getPhone())
                                    .build())
                            .collect(Collectors.toList())
            );
        }

        // createdAt y updatedAt se manejan automáticamente con @CreationTimestamp y @UpdateTimestamp

        return member;
    }
}