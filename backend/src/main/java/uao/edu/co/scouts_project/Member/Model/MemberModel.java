package uao.edu.co.scouts_project.Member.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.Map;
import java.util.List;

@Entity
@Table(name = "Member")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer member_id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subgroup_id", referencedColumnName = "subgroup_id", nullable = false)
    private SubgroupModel subgroup;

    private String first_name;
    private String last_name;
    private Integer age;
    private String role;
    @Positive
    @NotNull
    private Integer identification;
    private String document_type;
    @Email
    private String email;
    private String gender;
    private Timestamp birth_date;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;

    @Column(nullable = false, columnDefinition = "varchar default 'PENDING'")
    private String status = "PENDING";

    private Timestamp acceptance_date;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<Integer> in_charge_of;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private Map<String, Object> emergencyPhone;

    @Column(nullable = false)
    @UpdateTimestamp
    private Timestamp updated_at;

}

