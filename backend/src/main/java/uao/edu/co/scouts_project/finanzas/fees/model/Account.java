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

  @Column(name = "tenant_id", nullable = false)
  private String tenantId; 

  @Column(name = "user_id", nullable = false, unique = true)
  private String userId;

  @Column(name = "currency", nullable = false)
  private String currency = "COP";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "active", nullable = false)
  private boolean active = true;

  public Long getAccountId() { return accountId; }
  public String getTenantId() { return tenantId; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
