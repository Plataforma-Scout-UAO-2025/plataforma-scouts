package uao.edu.co.scouts_project.member.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subgroup")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Subgroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subgroupId;

}
