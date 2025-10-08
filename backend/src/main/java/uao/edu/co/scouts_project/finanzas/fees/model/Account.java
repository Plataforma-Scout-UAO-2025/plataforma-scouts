package uao.edu.co.scouts_project.finanzas.fees.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "account")
public class Account {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "account_id")
  private Long accountId;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId; 

  @Column(name = "member_id", nullable = false, unique = true)
  private Long memberId;

  @Column(name = "currency", nullable = false, columnDefinition = "text")
  private String currency = "COP";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "active", nullable = false)
  private boolean active = true;

  public Long getAccountId() { return accountId; }
  public String getTenantId() { return tenantId; }
  public Long getMemberId() { return memberId; }
  public String getCurrency() { return currency; }
  public Instant getCreatedAt() { return createdAt; }
  public boolean isActive() { return active; }


  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public void setAccountId(Long accountId) { this.accountId = accountId; }
  public void setMemberId(Long memberId) { this.memberId = memberId; }
  public void setCurrency(String currency) { this.currency = currency; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public void setActive(boolean active) { this.active = active; }
}
