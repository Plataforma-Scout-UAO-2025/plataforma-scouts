package uao.edu.co.scouts_project.member.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "School_Data")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class SchoolModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer school_data_id;

    @OneToOne
    @JoinColumn(name = "member_id", referencedColumnName = "member_id", nullable = false)

    private MemberModel member;
    private String institution;
    private String course;
    private String calendar;
    private String shift;


}
