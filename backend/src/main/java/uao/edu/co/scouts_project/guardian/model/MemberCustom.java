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

    private Long memberId;
    private String firstName;
    private String lastName;
    private String identification;
    private DocumentType documentType;
    private List<Member.EmergencyContact> emergencyContacts;
    private Integer age;
    private String gender;
    private String phone;
    private LocalDate birthDate;
    private String address;
    private Boolean isActive;
    private String email;
    private String role;
    private String relationship;

    public MemberCustom(Long memberId, String firstName, String lastName, String identification,
            DocumentType documentType, Integer age, String gender,
            String phone, LocalDate birthDate, String address, Boolean isActive, String email, String role, String relationship) {
        this.memberId = memberId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.identification = identification;
        this.documentType = documentType;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.birthDate = birthDate;
        this.address = address;
        this.isActive = isActive;
        this.email = email;
        this.role = role;
        this.relationship = relationship;
        this.emergencyContacts = null;
    }

}