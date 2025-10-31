package uao.edu.co.scouts_project.organigrama.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateGroupActiveStatusDTO {
    @JsonProperty("is_active")
    @NotNull
    private Boolean isActive;
}
