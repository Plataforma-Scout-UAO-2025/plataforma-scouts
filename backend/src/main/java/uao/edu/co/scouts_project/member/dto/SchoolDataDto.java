package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SchoolDataDto {

    @JsonProperty("school_data_id")
    private Long schoolDataId;

    @JsonProperty("member_id")
    private Long memberId;

    @JsonProperty("tenant_id")
    private String tenantId;

    private String institution;

    private String course;

    private String calendar;

    private String shift;
}