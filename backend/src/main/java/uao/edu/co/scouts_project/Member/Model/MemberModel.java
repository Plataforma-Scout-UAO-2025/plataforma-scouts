package uao.edu.co.scouts_project.Member.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.Member.Model.Enums.Estado;

import java.util.ArrayList;
import java.util.Date;

@Entity
@Table(name = "Member")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer member_id;
    @NotNull
    private Integer subgroup_id;
    private String firstname;
    private String lastname;
    private Integer age;
    private String role;
    @Positive
    @NotNull
    private Integer identification;
    private String document_type;
    @Email
    private String email;
    private String gender;
    private Date birth_date;
    private String address;
    private String phone;
    private Double weight;
    private Double height;
    private String hobbies;
    private String sports;
    private String instruments;
    private Estado status;
    private Date acceptance_date;
    private ArrayList<Integer> in_charge_of;
    private String emergency_phone;


}

