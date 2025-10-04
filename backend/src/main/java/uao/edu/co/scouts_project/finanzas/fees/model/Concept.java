package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;

@Entity
@Table(name = "concept")
public class Concept {

  @Id
  @Column(name = "concept_id")
  @SequenceGenerator(
      name = "concept_seq_gen",
      sequenceName = "concept_concept_id_seq", // <-- tal cual
      allocationSize = 1                        
  )
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "concept_seq_gen")
  private Long conceptId;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "description")
  private String description;

  @Column(name = "tenant_id")
  private Long tenantId;

  // getters y setters
  public Long getConceptId() {
    return conceptId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Long getTenantId() {
    return tenantId;
  }

  public void setTenantId(Long tenantId) {
    this.tenantId = tenantId;
  }

}
