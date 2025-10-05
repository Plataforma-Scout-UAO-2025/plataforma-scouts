package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


@Entity
@Table(name = "installment")
public class Installment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "installment_id")
  private Long installmentId;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId; 

  @Column(name = "account_id", nullable = false)
  private Long accountId;

  @Column(name = "concept_id", nullable = false)
  private Long conceptId;

  @Column(name = "due_date", nullable = false)
  private LocalDate dueDate;

  @Column(name = "amount", nullable = false)
  private BigDecimal amount;

  @Column(name = "status", nullable = false)
  private String status = "PENDING"; // PENDING | PARTIAL | PAID | OVERDUE

  @Column(name = "balance", nullable = false)
  private BigDecimal balance;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  private JsonNode payments;

  public Installment() {}

  public Installment(Long accountId, Long conceptId, LocalDate dueDate, BigDecimal amount) {
    this.accountId = accountId;
    this.conceptId = conceptId;
    this.dueDate = dueDate;
    this.amount = amount;
    this.balance = amount;
  }

  public Long getInstallmentId() { return installmentId; }
  public Long getAccountId() { return accountId; }
  public Long getConceptId() { return conceptId; }
  public LocalDate getDueDate() { return dueDate; }
  public BigDecimal getAmount() { return amount; }
  public String getStatus() { return status; }
  public BigDecimal getBalance() { return balance; }
  public JsonNode getPayments() { return payments; }
  public String getTenantId() { return tenantId; }

  public void setStatus(String status) { this.status = status; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
