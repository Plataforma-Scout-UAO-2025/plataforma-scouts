package uao.edu.co.scouts_project.finanzas.fees.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "installment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "installmentId")
@ToString
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

  @Builder.Default
  @Column(name = "status", nullable = false, columnDefinition = "text")
  private String status = "PENDING"; // PENDING | PARTIAL | PAID | OVERDUE

  @Column(name = "balance", nullable = false, precision = 12, scale = 2)
  private BigDecimal balance;

  @Builder.Default
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payments", nullable = false, columnDefinition = "jsonb not null default '[]'::jsonb")
  private JsonNode payments = JsonNodeFactory.instance.arrayNode();

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

  // constructor adicional útil para creación directa con valores automaticos
  public Installment(Long accountId, Long conceptId, LocalDate dueDate, BigDecimal amount) {
    this.accountId = accountId;
    this.conceptId = conceptId;
    this.dueDate = dueDate;
    this.amount = amount;
    this.balance = amount;
  }
}
