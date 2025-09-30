package uao.edu.co.scouts_project.Member.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto {

    private Integer member_id;
    private Integer subgroup_id;
    private String first_name;
    private String last_name;
    private Integer age;
    private String role;
    private Integer identification;
    private String document_type;
    private String email;
    private String gender;
    private Date birthDate;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;
    private String status;
    private Timestamp acceptance_date;
    private ArrayList<Integer> in_charge_of;
    private Map<String, Object> emergency_phone;

}
