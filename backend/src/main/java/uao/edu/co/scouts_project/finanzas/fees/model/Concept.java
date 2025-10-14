package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "concept")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "conceptId")
@ToString
public class Concept {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "concept_id")
  private Long conceptId;

  @Column(name = "name", nullable = false, columnDefinition = "text")
  private String name;

  @Column(name = "description", nullable = false, columnDefinition = "text")
  private String description;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId;
}
