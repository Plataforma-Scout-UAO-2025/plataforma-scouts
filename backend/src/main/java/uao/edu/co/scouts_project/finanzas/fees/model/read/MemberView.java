package uao.edu.co.scouts_project.finanzas.fees.model.read;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "member")
@Immutable
public class MemberView {

  @Id
  @Column(name = "user_id") 
  private String userId;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "age")
  private Integer age;

  @Column(name = "subgroup_id")
  private Long subgroup;

  @Column(name = "tenant_id")
  private String tenantId;

  // JPA necesita ctor por defecto (al menos protected)
  protected MemberView() {}

  // getters
  public String getUserId() { return userId; }
  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public Integer getAge() { return age; }
  public Long getSubgroup() { return subgroup; }
  public String getTenantId() { return tenantId; }
}
