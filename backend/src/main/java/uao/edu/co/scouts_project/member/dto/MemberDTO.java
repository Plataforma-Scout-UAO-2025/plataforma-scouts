package uao.edu.co.scouts_project.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class MemberDTO {
    
    private Long memberId;
    private Long subgroupId;
    private String firstName;
    private String lastName;
    private Integer age;
    private String role;
    private String identification;
    private String documentType;
    private String email;
    private String gender;
    private LocalDate birthDate;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private boolean isActive;
    private String hobbies;
    private String sports;
    private String instruments;
    private String status;
    private LocalDate acceptanceDate;
    private List<Integer> inChargeOf;
    private Map<String, Object> emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
