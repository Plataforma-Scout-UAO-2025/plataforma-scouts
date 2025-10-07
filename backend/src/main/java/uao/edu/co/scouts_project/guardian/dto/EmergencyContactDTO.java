package uao.edu.co.scouts_project.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyContactDTO {
    @NotNull
    private String name;
    @NotNull
    private String relationship;
    @NotNull
    private String phone;
}