package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.member.dto.ListMemberDto;
import uao.edu.co.scouts_project.member.model.Member;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para convertir entre entidades Member y DTOs ListMemberDto.
 * Proporciona conversión optimizada para listados con información básica.
 */
public class ListMemberMapper {

    private ListMemberMapper() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Convierte una entidad Member a ListMemberDto.
     *
     * @param member Entidad Member a convertir.
     * @return DTO con información básica del miembro.
     */
    public static ListMemberDto toDto(Member member) {
        if (member == null) {
            return null;
        }

        return ListMemberDto.builder()
                .member_id(member.getMemberId())
                .user_id(member.getUserId())
                .tenant_id(member.getTenantId())
                .guardian_id(member.getGuardianId())
                .first_name(member.getFirstName())
                .last_name(member.getLastName())
                .age(member.getAge())
                .role(member.getRole())
                .identification(member.getIdentification())
                .document_type(member.getDocumentType())
                .email(member.getEmail())
                .gender(member.getGender())
                .birth_date(member.getBirthDate())
                .address(member.getAddress())
                .phone(member.getPhone())
                .weight(member.getWeight())
                .height(member.getHeight())
                .hobbies(member.getHobbies())
                .sports(member.getSports())
                .instruments(member.getInstruments())
                .is_active(member.getIsActive())
                .relationship(member.getRelationship())
                .status(member.getStatus())
                .acceptance_date(member.getAcceptanceDate())
                .emergency_contacts(mapEmergencyContacts(member.getEmergencyContacts()))
                .created_at(member.getCreatedAt())
                .updated_at(member.getUpdatedAt())
                .build();
    }

    /**
     * Convierte una lista de entidades Member a una lista de ListMemberDto.
     *
     * @param members Lista de entidades Member.
     * @return Lista de DTOs con información básica.
     */
    public static List<ListMemberDto> toDtoList(List<Member> members) {
        if (members == null) {
            return List.of();
        }

        return members.stream()
                .map(ListMemberMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convierte los contactos de emergencia de Member a EmergencyContactDto.
     *
     * @param emergencyContacts Lista de contactos de emergencia del Member.
     * @return Lista de DTOs de contactos de emergencia.
     */
    private static List<ListMemberDto.EmergencyContactDto> mapEmergencyContacts(
            List<Member.EmergencyContact> emergencyContacts) {

        if (emergencyContacts == null) {
            return null;
        }

        return emergencyContacts.stream()
                .map(contact -> ListMemberDto.EmergencyContactDto.builder()
                        .name(contact.getName())
                        .relationship(contact.getRelationship())
                        .phone(contact.getPhone())
                        .build())
                .collect(Collectors.toList());
    }
}