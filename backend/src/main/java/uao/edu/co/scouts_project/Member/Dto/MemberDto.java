package uao.edu.co.scouts_project.Member.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    private Integer memberId;
    private Integer subgroupId;
    private String firstname;
    private String lastname;
    private Integer age;
    private String role;
    private Integer identification;
    private String documentType;
    private String email;
    private String gender;
    private Date birthDate;
    private String address;
    private String phone;
    private Double weight;
    private Double height;
    private String hobbies;
    private String sports;
    private String instruments;
    private String status;
    private Date acceptanceDate;
    private ArrayList<Integer> inChargeOf;
    private String emergencyPhone;

}
