package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO que representa la información completa de un miembro dentro del sistema Scouts.
 * Esta clase contiene los datos personales, de contacto, de afiliación (subgrupo),
 * y la información relacionada con el estado del miembro, incluyendo contactos de emergencia.
 * Se utiliza principalmente para la transferencia de datos entre las capas de aplicación,
 * evitando exponer directamente las entidades del dominio.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    @JsonProperty("memberId")
    private Long memberId;

    @JsonProperty("userId")
    private String userId;

    @NotBlank(message = "El tenant_id es obligatorio")
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("guardianId")
    private Integer guardianId;

    @JsonProperty("subgroup")
    @Valid
    private SubgroupDTO subgroup;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @JsonProperty("firstName")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @JsonProperty("lastName")
    private String lastName;

    @Min(value = 0, message = "La edad no puede ser negativa")
    @Max(value = 150, message = "La edad no puede ser mayor a 150")
    private Integer age;

    private String role;

    @NotBlank(message = "La identificación es obligatoria")
    private String identification;

    @NotBlank(message = "El tipo de documento es obligatorio")
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

    @Pattern(regexp = "^(APPROVED|REJECTED|PENDING)$", 
             message = "Estado inválido. Valores permitidos: APPROVED, REJECTED, PENDING")
    private String status;

    @JsonProperty("acceptanceDate")
    private LocalDate acceptanceDate;

    @JsonProperty("emergencyContacts")
    private List<EmergencyContactDto> emergencyContacts;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @NotBlank(message = "Tratamiento de datos obligatorio")
    @JsonProperty("accept_treatment")
    private Boolean acceptTreatment;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmergencyContactDto {
        
        @NotBlank(message = "El nombre del contacto de emergencia es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        private String name;
        
        @NotBlank(message = "La relación del contacto es obligatoria")
        private String relationship;
        
        @NotBlank(message = "El teléfono del contacto es obligatorio")
        @Pattern(regexp = "^[+]?[0-9]{7,15}$", 
                 message = "El teléfono debe contener entre 7 y 15 dígitos")
        private String phone;
    }
}