package uao.edu.co.scouts_project.guardian.model;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.model.Member;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberCustom {

    private String firstName;
    private String lastName;
    private String identification;
    private DocumentType documentType;
    private List<Member.EmergencyContact> emergencyContacts;
    private Integer age;
    private String gender;
    private String phone;
    private LocalDate birthDate;

    public MemberCustom(String firstName, String lastName, String identification,
            DocumentType documentType, Integer age, String gender,
            String phone, LocalDate birthDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.identification = identification;
        this.documentType = documentType;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.birthDate = birthDate;
        this.emergencyContacts = null;
    }

}