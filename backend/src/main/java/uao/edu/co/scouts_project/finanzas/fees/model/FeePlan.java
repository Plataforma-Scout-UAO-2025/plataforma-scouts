package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

@Entity
@Table(name = "fee_plan")
public class FeePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fee_plan_id")
    private Long feePlanId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId; 

    @ManyToOne(optional = false)
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    // numeric en DB (sin precision/scale explícito)
    @Column(name = "amount", nullable = false, columnDefinition = "numeric")
    private BigDecimal amount;

    // text en DB (con constraint de valores válidos)
    @Column(name = "periodicity", columnDefinition = "text", nullable = false)
    private String periodicity;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "proratable", columnDefinition = "boolean default false", nullable = false)
    private boolean proratable = false;

    @Column(name = "scope", columnDefinition = "text", nullable = false)
    private String scope;

    @Column(name = "associated_to", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode associatedTo;

  // getters y setters
  public Long getFeePlanId() {
    return feePlanId;
  }

  public Concept getConcept() {
    return concept;
  }

  public void setConcept(Concept concept) {
    this.concept = concept;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public boolean isProratable() {
    return proratable;
  }

  public void setProratable(boolean proratable) {
    this.proratable = proratable;
  }

  public String getScope() {
    return scope;
  }

  public void setScope(String scope) {
    this.scope = scope;
  }

  public String getTenantId() { 
    return tenantId; 
  }
  
  public void setTenantId(String tenantId) { 
    this.tenantId = tenantId; 
  }

  public String getPeriodicity() {
    return periodicity;
  }

  public void setPeriodicity(String periodicity) {
    this.periodicity = periodicity;
  }

  public JsonNode getAssociatedTo() {
    return associatedTo;
  }

  public void setAssociatedTo(JsonNode associatedTo) {
      this.associatedTo = associatedTo;
  }

}
