package uao.edu.co.scouts_project.member.mapper;

import lombok.extern.slf4j.Slf4j;
import uao.edu.co.scouts_project.member.dto.UpdateMemberDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.stream.Collectors;

/**
 * Mapper especializado para actualizaciones parciales de miembros.
 * Convierte UpdateMemberDto a una entidad Member con solo los campos informados.
 */
@Slf4j
public class UpdateMemberMapper {

    /**
     * Convierte un UpdateMemberDto a una entidad Member.
     * Solo crea el Member con los campos que NO sean nulos en el DTO.
     * Esta entidad "parcial" se usará para actualizar solo esos campos.
     *
     * @param updateDto DTO con los campos a actualizar
     * @return Member con solo los campos informados (los demás quedan null)
     */
    public static Member toEntity(UpdateMemberDto updateDto) {
        if (updateDto == null) {
            return null;
        }

        Member member = new Member();

        // Campos personales
        member.setFirstName(updateDto.getFirstName());
        member.setLastName(updateDto.getLastName());
        member.setAge(updateDto.getAge());
        member.setRole(updateDto.getRole());

        // Tipo de documento
        if (updateDto.getDocumentType() != null) {
            try {
                DocumentType docType = DocumentType.valueOf(updateDto.getDocumentType().trim().toUpperCase());
                member.setDocumentType(docType);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        String.format("Tipo de documento inválido: '%s'", updateDto.getDocumentType())
                );
            }
        }

        member.setEmail(updateDto.getEmail());
        member.setGender(updateDto.getGender());
        member.setBirthDate(updateDto.getBirthDate());
        member.setAddress(updateDto.getAddress());
        member.setPhone(updateDto.getPhone());

        // Información física y hobbies
        member.setWeight(updateDto.getWeight());
        member.setHeight(updateDto.getHeight());
        member.setHobbies(updateDto.getHobbies());
        member.setSports(updateDto.getSports());
        member.setInstruments(updateDto.getInstruments());

        // Estado activo y relación
        member.setIsActive(updateDto.getIsActive());
        member.setRelationship(updateDto.getRelationship());

        // Estado
        if (updateDto.getStatus() != null) {
            try {
                Status status = Status.valueOf(updateDto.getStatus().trim().toUpperCase());
                member.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        String.format("Estado inválido: '%s'", updateDto.getStatus())
                );
            }
        }

        if (updateDto.getEmergencyContacts() != null) {
            member.setEmergencyContacts(
                    updateDto.getEmergencyContacts().stream()
                            .map(ecDto -> Member.EmergencyContact.builder()
                                    .name(ecDto.getName())
                                    .relationship(ecDto.getRelationship())
                                    .phone(ecDto.getPhone())
                                    .build())
                            .collect(Collectors.toList())
            );
        }

        return member;
    }

    /**
     * Convierte una entidad Member a un UpdateMemberDto.
     * Útil para devolver la respuesta después de una actualización.
     *
     * @param member Entidad Member
     * @return UpdateMemberDto con todos los campos del member
     */
    public static UpdateMemberDto toDto(Member member) {
        if (member == null) {
            return null;
        }

        UpdateMemberDto dto = new UpdateMemberDto();

        // Campos personales
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setAge(member.getAge());
        dto.setRole(member.getRole());

        // Tipo de documento
        if (member.getDocumentType() != null) {
            dto.setDocumentType(member.getDocumentType().name());
        }

        dto.setEmail(member.getEmail());
        dto.setGender(member.getGender());
        dto.setBirthDate(member.getBirthDate());
        dto.setAddress(member.getAddress());
        dto.setPhone(member.getPhone());

        // Información física y hobbies
        dto.setWeight(member.getWeight());
        dto.setHeight(member.getHeight());
        dto.setHobbies(member.getHobbies());
        dto.setSports(member.getSports());
        dto.setInstruments(member.getInstruments());

        // Estado activo y relación
        dto.setIsActive(member.getIsActive());
        dto.setRelationship(member.getRelationship());

        // Estado
        if (member.getStatus() != null) {
            dto.setStatus(member.getStatus().name());
        }

        // Contactos de emergencia
        if (member.getEmergencyContacts() != null) {
            dto.setEmergencyContacts(
                    member.getEmergencyContacts().stream()
                            .map(ec -> UpdateMemberDto.EmergencyContactUpdateDto.builder()
                                    .name(ec.getName())
                                    .relationship(ec.getRelationship())
                                    .phone(ec.getPhone())
                                    .build())
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}