package uao.edu.co.scouts_project.guardian.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GuardianCreateResponse(
        @JsonProperty("member_id") Long id) {
}
