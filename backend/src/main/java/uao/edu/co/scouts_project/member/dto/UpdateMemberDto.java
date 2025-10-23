package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO específico para actualizaciones parciales de miembros.
 * Todos los campos son opcionales para permitir actualizaciones flexibles.
 * Solo los campos que vengan informados serán actualizados.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMemberDto {

    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @JsonProperty("first_name")
    private String firstName;

    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @JsonProperty("lastName")
    private String lastName;

    @Min(value = 0, message = "La edad no puede ser negativa")
    @Max(value = 150, message = "La edad no puede ser mayor a 150")
    private Integer age;

    private String role;

    @Pattern(regexp = "^(CC|TI|CE|PASSPORT|RC|NUIP)$",
            message = "Tipo de documento inválido. Valores permitidos: CC, TI, CE, PASSPORT, RC, NUIP")
    @JsonProperty("documentType")
    private String documentType;

    @Email(message = "El formato del email es inválido")
    private String email;

    private String gender;

    @JsonProperty("birthDate")
    private LocalDate birthDate;

    private String address;

    @Pattern(regexp = "^[+]?[0-9]{7,15}$",
            message = "El teléfono debe contener entre 7 y 15 dígitos")
    private String phone;

    private String weight;

    private String height;

    @Size(max = 500, message = "Los hobbies no pueden exceder 500 caracteres")
    private String hobbies;

    @Size(max = 500, message = "Los deportes no pueden exceder 500 caracteres")
    private String sports;

    @Size(max = 500, message = "Los instrumentos no pueden exceder 500 caracteres")
    private String instruments;

    @JsonProperty("isActive")
    private Boolean isActive;

    private String relationship;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|SUSPENDED|PENDING)$",
            message = "Estado inválido. Valores permitidos: ACTIVE, INACTIVE, SUSPENDED, PENDING")
    private String status;

    @JsonProperty("emergencyContacts")
    @Valid
    private List<EmergencyContactUpdateDto> emergencyContacts;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmergencyContactUpdateDto {

        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        private String name;

        private String relationship;

        @Pattern(regexp = "^[+]?[0-9]{7,15}$",
                message = "El teléfono debe contener entre 7 y 15 dígitos")
        private String phone;
    }
}