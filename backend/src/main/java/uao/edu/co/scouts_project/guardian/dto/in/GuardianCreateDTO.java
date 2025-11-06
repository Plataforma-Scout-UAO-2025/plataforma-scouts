package uao.edu.co.scouts_project.guardian.dto.in;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uao.edu.co.scouts_project.guardian.dto.shared.SubgroupDTO;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class GuardianCreateDTO {
    private Long memberId;
    private String userId;
    private SubgroupDTO subgroup;
    private String role;
    private String tenantId;
    private String subgroupId;
    @NotBlank(message = "El nombre es obligatorio")
    @JsonProperty("first_name")
    private String firstName;
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
    private LocalDate birthDate;
    @Size(max = 10, message = "El ID no debe exceder 10 caracteres")
    private String identification;
    private DocumentType documentType;
    private String address;
    @Size(max = 10, message = "Teléfono no debe exceder 10 caracteres")
    private String phone;
    private Boolean acceptTreatment;
    private String gender;
    private Boolean isActive;
    private Status status;
    private LocalDate acceptanceDate;
}