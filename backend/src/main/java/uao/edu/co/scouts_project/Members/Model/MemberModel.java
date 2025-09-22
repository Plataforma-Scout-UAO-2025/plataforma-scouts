package uao.edu.co.scouts_project.Members.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Solicitud")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberModel {

    @Id
    @NotBlank @Positive
    private Long identification;
    @NotNull
    private String name;
    @NotNull
    private String lastName;
    @Email
    private String email;
    private String documentType;
    private String gender;
    private String birthDate;
    private String city;
    private String address;
    private Long phone;
    private String institution;
    private String course;
    private String schoolCalendar;
    private String schoolShift;
    private Double weight;
    private Double height;
    private String bloodType;
    private String rhFactor;
    private String hobbies;
    private String sports;
    private String instruments;

}
