package uao.edu.co.scouts_project.Member.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subgroup")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubgroupModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subgroup_id;

}
