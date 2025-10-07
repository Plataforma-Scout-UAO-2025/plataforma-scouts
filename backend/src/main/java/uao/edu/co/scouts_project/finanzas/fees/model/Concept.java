package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;

@Entity
@Table(name = "concept")
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

  // getters y setters
  public Long getConceptId() {
    return conceptId;
  }

  public void setConceptId(Long conceptId) {
    this.conceptId = conceptId;
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

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

}
