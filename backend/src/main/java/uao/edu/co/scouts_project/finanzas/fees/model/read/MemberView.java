package uao.edu.co.scouts_project.finanzas.fees.model.read;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "member")
@Immutable
public class MemberView {

  @Id
  @Column(name = "member_id")   // <-- AQUÍ el fix: usar member_id
  private Long memberId;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "age")
  private Integer age;

  @Column(name = "subgroup_id")
  private Long subgroup;

  @Column(name = "tenant_id")
  private Long tenantId;

  // JPA necesita ctor por defecto (al menos protected)
  protected MemberView() {}

  // getters
  public Long getMemberId() { return memberId; }
  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public Integer getAge() { return age; }
  public Long getSubgroup() { return subgroup; }
  public Long getTenantId() { return tenantId; }
}
