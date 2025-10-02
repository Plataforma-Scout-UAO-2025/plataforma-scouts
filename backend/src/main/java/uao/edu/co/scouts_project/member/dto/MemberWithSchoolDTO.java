package uao.edu.co.scouts_project.member.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;

public class MemberWithSchoolDTO {
    
    private Integer subgroup_id;
    private String first_name;
    private String last_name;
    private Integer age;
    private String role;
    private Integer identification;
    private String document_type;
    private String email;
    private String gender;
    private LocalDate birthDate;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;
    private String status;
    private LocalDate acceptanceDate;
    private ArrayList<Integer> inChargeOf;
    private Map<String, Object> emergencyContact;

    private String institution;
    private String course;
    private String calendar;
    private String shift;
}
