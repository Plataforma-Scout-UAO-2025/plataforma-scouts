package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa la información escolar asociada a un miembro del sistema Scouts.
 * <p>
 * Esta clase encapsula los datos académicos de un miembro, incluyendo la institución educativa,
 * el curso, el calendario y la jornada. Se utiliza para transferir información entre capas
 * sin exponer directamente las entidades del dominio.
 * Generalmente se asocia a un {@link MemberDto} para mantener la relación entre el miembro y su información escolar.
 */

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