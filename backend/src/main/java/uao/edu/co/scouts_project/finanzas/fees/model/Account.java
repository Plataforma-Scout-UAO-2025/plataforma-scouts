package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "accountId")
@ToString
public class Account {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "account_id")
  private Long accountId;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId;

  @Column(name = "member_id", nullable = false, unique = true)
  private Long memberId;

  @Builder.Default
  @Column(name = "currency", nullable = false, columnDefinition = "text")
  private String currency = "COP";

  @Builder.Default
  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Builder.Default
  @Column(name = "active", nullable = false)
  private boolean active = true;
}
