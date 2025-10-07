package uao.edu.co.scouts_project.guardian.dto.shared;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmergencyContactDTO {
    @NotNull
    private String name;
    @NotNull
    private String relationship;
    @Size(max = 10)
    private String phone;
}