package uao.edu.co.scouts_project.member.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "DTO para crear un nuevo miembro dentro de un grupo u organización.")
public class CreateMemberDTO {

    @JsonProperty("user_id")
    @Schema(example = "auth0|67890abcd123456efg7890")
    private String userId;

    @JsonProperty("tenant_id")
    @Schema(example = "org_abc123")
    private String tenantId;

    @JsonProperty("first_name")
    @Schema(example = "Juan")
    private String firstName;

    @JsonProperty("last_name")
    @Schema(example = "Pérez")
    private String lastName;

    @Schema(example = "25")
    private Integer age;

    @Schema(example = "SCOUT")
    private String role;

    @Schema(example = "1122334455")
    private String identification;

    @JsonProperty("document_type")
    @Schema(description = "Tipo de documento de identidad.", example = "CC")
    @NotNull
    private DocumentType documentType;

    @Email
    @Schema(example = "juan.perez@example.com")
    private String email;

    @Schema(example = "Masculino")
    private String gender;

    @JsonProperty("birth_date")
    @Schema(example = "2000-05-14")
    private LocalDate birthDate;

    @Schema(example = "Calle 123 #45-67, Cali, Colombia")
    private String address;

    @Schema(example = "+57 3123456789")
    private String phone;

    @Schema(example = "70kg")
    private String weight;

    @Schema(example = "1.75m")
    private String height;

    @Schema(example = "Leer, programar, acampar")
    private String hobbies;

    @Schema(example = "Fútbol, ciclismo")
    private String sports;

    @Schema(example = "Guitarra, piano")
    private String instruments;

    @JsonProperty("is_active")
    @Schema(example = "true")
    private Boolean isActive;

    @Schema(example = "Padre")
    private String relationship;

    @JsonProperty("status")
    @Schema(example = "APPROVED")
    private Status status;

    @JsonProperty("acceptance_date")
    @Schema(example = "2025-11-03")
    private LocalDate acceptanceDate;

    @JsonProperty("emergency_contacts")
    @Schema(description = "Lista de contactos de emergencia del miembro.")
    private List<EmergencyContactDTO> emergencyContacts;

    @JsonProperty("accept_treatment")
    @Schema(description = "Indica si el miembro acepta el tratamiento de datos personales.", example = "true")
    private Boolean acceptTreatment;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @Schema(description = "Información de un contacto de emergencia.")
    public static class EmergencyContactDTO {

        @JsonProperty("name")
        @Schema(example = "María Pérez")
        private String name;

        @JsonProperty("relationship")
        @Schema(example = "Madre")
        private String relationship;

        @JsonProperty("phone")
        @Schema(example = "+57 3109876543")
        private String phone;
    }
}
