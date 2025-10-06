package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


@Entity
@Table(name = "installment")
public class Installment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "installment_id")
  private Long installmentId;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId; 

  @Column(name = "account_id", nullable = false)
  private Long accountId;

  @Column(name = "concept_id", nullable = false)
  private Long conceptId;

  @Column(name = "due_date", nullable = false)
  private LocalDate dueDate;

  @Column(name = "amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Column(name = "status", nullable = false, columnDefinition = "text")
  private String status = "PENDING"; // PENDING | PARTIAL | PAID | OVERDUE

  @Column(name = "balance", nullable = false, precision = 12, scale = 2)
  private BigDecimal balance;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payments", nullable = false, columnDefinition = "jsonb not null default '[]'::jsonb")
  private JsonNode payments = JsonNodeFactory.instance.arrayNode();  // <-- init

  @PrePersist
  public void prePersist() {
    if (payments == null) {
      payments = JsonNodeFactory.instance.arrayNode();
    }
    if (status == null || status.isBlank()) {
      status = "PENDING";
    }
    if (balance == null) {
      balance = amount; 
    }
  }

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
  public void setBalance(BigDecimal balance) { this.balance = balance; }
  public void setInstallmentId(Long installmentId) {this.installmentId = installmentId; }
  public void setAccountId(Long accountId) {this.accountId = accountId; }
  public void setConceptId(Long conceptId) {this.conceptId = conceptId; }
  public void setDueDate(LocalDate dueDate) {this.dueDate = dueDate; }
  public void setPayments(JsonNode payments) {this.payments = payments; }
}
