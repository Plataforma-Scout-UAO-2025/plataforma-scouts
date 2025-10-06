package uao.edu.co.scouts_project.finanzas.fees.model.read;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "member")
@Immutable
public class MemberView {

  @Id
  @Column(name = "member_id", nullable = false, columnDefinition = "text")
  private Long memberId;

  @Column(name = "first_name", nullable = false, columnDefinition = "text")
  private String firstName;

  @Column(name = "last_name", nullable = false, columnDefinition = "text")
  private String lastName;

  @Column(name = "age")
  private Integer age;

  @Column(name = "subgroup_id")
  private Long subgroup;

  @Column(name = "tenant_id", nullable = false, columnDefinition = "text")
  private String tenantId;  

  // JPA necesita ctor por defecto (al menos protected)
  protected MemberView() {}

  // getters
  public Long getMemberId() { return memberId; }
  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public Integer getAge() { return age; }
  public Long getSubgroup() { return subgroup; }
  public String getTenantId() { return tenantId; }
}
