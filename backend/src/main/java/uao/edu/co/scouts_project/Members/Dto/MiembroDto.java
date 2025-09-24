package uao.edu.co.scouts_project.Members.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroDto {

    private Long identification;
    private String firstName;
    private String lastName;
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
