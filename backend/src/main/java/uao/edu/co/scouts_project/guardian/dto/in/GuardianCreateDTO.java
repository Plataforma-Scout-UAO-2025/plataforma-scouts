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

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GuardianCreateDTO {
    private String userId;
    private SubgroupDTO subgroup;
    private String rol;
    private String tenantId;
    private String subgroupId;
    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;
    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
    @Positive(message = "Edad debe ser un número positivo")
    private Integer age;
    @Size(max = 10, message = "El ID no debe exceder 10 caracteres")
    private String identification;
    private DocumentType documentType;
    @Size(max = 10, message = "Teléfono no debe exceder 10 caracteres")
    private String phone;
    private String relationship;
    private Boolean isActive;
    private Status status;
    private LocalDate acceptanceDate;
}