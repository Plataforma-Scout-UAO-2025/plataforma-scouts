package uao.edu.co.scouts_project.guardian.model;

import java.time.LocalDate;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Builder
public class MemberCustom {

    private Long memberId;
    private String firstName;
    private String lastName;
    private String gender;
    private String phone;
    private LocalDate birthDate;

    // Constructor for JPA projection queries
    public MemberCustom(Long memberId, String firstName, String lastName, String gender, String phone, LocalDate birthDate) {
        this.memberId = memberId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.phone = phone;
        this.birthDate = birthDate;
    }
}