package uao.edu.co.scouts_project.guardian.dto.shared;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class SubgroupDTO {
    private Long subgroupId;
    private String name;
    private String description;
}
