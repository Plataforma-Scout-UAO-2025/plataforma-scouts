package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class AssignSubgroupDto {

    @NotNull(message = "El ID del miembro es requerido")
    @JsonProperty("memberId")
    private Long memberId;

    @NotNull(message = "El ID del subgrupo es requerido")
    @JsonProperty("subGroupId")
    private Long subGroupId;
}