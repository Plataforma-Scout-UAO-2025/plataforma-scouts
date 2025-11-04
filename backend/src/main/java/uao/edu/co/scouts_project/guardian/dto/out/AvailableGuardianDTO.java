package uao.edu.co.scouts_project.guardian.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableGuardianDTO {

    private Long memberId;
    private String firstName;
    private String lastName;
    private String identification;
}
