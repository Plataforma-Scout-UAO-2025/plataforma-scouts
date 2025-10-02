package uao.edu.co.scouts_project.member.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SchoolData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long schoolDataId;

    @OneToOne
    @JoinColumn(name = "member_id", referencedColumnName = "member_id", nullable = false)
    private Member member;
    private String institution;
    private String course;
    private String calendar;
    private String shift;


}
