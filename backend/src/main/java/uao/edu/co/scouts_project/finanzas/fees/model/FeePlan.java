package uao.edu.co.scouts_project.finanzas.fees.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fee_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "feePlanId")
@ToString(exclude = "concept")
public class FeePlan {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "fee_plan_id")
  private Long feePlanId;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "concept_id", nullable = false, columnDefinition = "text")
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
  @Builder.Default
  private boolean proratable = false;

  @Column(name = "scope", columnDefinition = "text", nullable = false)
  private String scope;

  @Column(name = "associated_to", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode associatedTo;
}
