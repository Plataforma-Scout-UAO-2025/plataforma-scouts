package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.member.dto.CreateMemberDTO;
import uao.edu.co.scouts_project.member.dto.MemberDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.stream.Collectors;

/**
 * Mapper para convertir entre entidades Member y DTOs MemberDto.
 * Facilita la conversión de datos entre las capas del sistema.
 */
public class MemberMapper {

    /**
     * Convierte una entidad Member a un DTO MemberDto.
     *
     * @param member Entidad Member a convertir.
     * @return DTO con la información del miembro.
     */
    public static MemberDto toDto(Member member) {
        if (member == null)
            return null;

        return MemberDto.builder()
                .memberId(member.getMemberId())
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .guardianId(member.getGuardianId())
                .subgroup(SubGroupMapper.toDto(member.getSubgroup()))
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
                                : null)
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .acceptTreatment(member.getAcceptTreatment())
                .build();
    }

    public static Member toEntityFromCreateDto(CreateMemberDTO dto) {
        if (dto == null) {
            return null;
        }

        return Member.builder()
                .userId(dto.getUserId())
                .tenantId(dto.getTenantId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .age(dto.getAge())
                .role(dto.getRole())
                .identification(dto.getIdentification())
                .documentType(dto.getDocumentType())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .birthDate(dto.getBirthDate())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .hobbies(dto.getHobbies())
                .sports(dto.getSports())
                .instruments(dto.getInstruments())
                .isActive(dto.getIsActive())
                .relationship(dto.getRelationship())
                .status(dto.getStatus())
                .acceptanceDate(dto.getAcceptanceDate())
                .acceptTreatment(dto.getAcceptTreatment())
                .emergencyContacts(dto.getEmergencyContacts() != null
                        ? dto.getEmergencyContacts().stream()
                                .map(contact -> Member.EmergencyContact.builder()
                                        .name(contact.getName())
                                        .relationship(contact.getRelationship())
                                        .phone(contact.getPhone())
                                        .build())
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

    /**
     * Convierte un DTO MemberDto a una entidad Member.
     *
     * @param dto Objeto DTO a convertir.
     * @return Entidad Member lista para persistir.
     * @throws IllegalArgumentException si los valores de los enums son inválidos
     */
    public static Member toEntity(MemberDto dto) {
        if (dto == null)
            return null;

        Member member = new Member();

        member.setMemberId(dto.getMemberId());
        member.setUserId(dto.getUserId());
        member.setTenantId(dto.getTenantId());
        member.setGuardianId(dto.getGuardianId());

        if (dto.getSubgroup() != null) {
            member.setSubgroup(SubGroupMapper.toEntity(dto.getSubgroup()));
        }

        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setAge(dto.getAge());
        member.setRole(dto.getRole());
        member.setIdentification(dto.getIdentification());

        // Conversión segura de DocumentType con normalización
        if (dto.getDocumentType() != null) {
            member.setDocumentType(parseDocumentType(dto.getDocumentType()));
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

        // Conversión segura de Status con normalización
        if (dto.getStatus() != null) {
            member.setStatus(parseStatus(dto.getStatus()));
        }

        member.setAcceptanceDate(dto.getAcceptanceDate());
        member.setAcceptTreatment(dto.getAcceptTreatment());

        if (dto.getEmergencyContacts() != null) {
            member.setEmergencyContacts(
                    dto.getEmergencyContacts().stream()
                            .map(ecDto -> Member.EmergencyContact.builder()
                                    .name(ecDto.getName())
                                    .relationship(ecDto.getRelationship())
                                    .phone(ecDto.getPhone())
                                    .build())
                            .collect(Collectors.toList()));
        }

        return member;
    }

    /**
     * Convierte de forma segura un String a DocumentType, normalizando
     * mayúsculas/minúsculas.
     *
     * @param documentTypeStr String con el tipo de documento
     * @return DocumentType correspondiente
     * @throws IllegalArgumentException si el valor no es válido
     */
    private static DocumentType parseDocumentType(String documentTypeStr) {
        if (documentTypeStr == null || documentTypeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("El tipo de documento no puede estar vacío");
        }

        // Normalizar a mayúsculas y eliminar espacios
        String normalized = documentTypeStr.trim().toUpperCase();

        try {
            return DocumentType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    String.format("Tipo de documento inválido: '%s'. Valores permitidos: %s",
                            documentTypeStr,
                            String.join(", ", getDocumentTypeValues())));
        }
    }

    /**
     * Convierte de forma segura un String a Status, normalizando
     * mayúsculas/minúsculas.
     *
     * @param statusStr String con el estado
     * @return Status correspondiente
     * @throws IllegalArgumentException si el valor no es válido
     */
    private static Status parseStatus(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("El estado no puede estar vacío");
        }

        // Normalizar a mayúsculas y eliminar espacios
        String normalized = statusStr.trim().toUpperCase();

        try {
            return Status.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    String.format("Estado inválido: '%s'. Valores permitidos: %s",
                            statusStr,
                            String.join(", ", getStatusValues())));
        }
    }

    /**
     * Obtiene los valores válidos de DocumentType como lista de Strings.
     *
     * @return Array con los nombres de los valores del enum
     */
    private static String[] getDocumentTypeValues() {
        DocumentType[] types = DocumentType.values();
        String[] values = new String[types.length];
        for (int i = 0; i < types.length; i++) {
            values[i] = types[i].name();
        }
        return values;
    }

    /**
     * Obtiene los valores válidos de Status como lista de Strings.
     *
     * @return Array con los nombres de los valores del enum
     */
    private static String[] getStatusValues() {
        Status[] statuses = Status.values();
        String[] values = new String[statuses.length];
        for (int i = 0; i < statuses.length; i++) {
            values[i] = statuses[i].name();
        }
        return values;
    }
}