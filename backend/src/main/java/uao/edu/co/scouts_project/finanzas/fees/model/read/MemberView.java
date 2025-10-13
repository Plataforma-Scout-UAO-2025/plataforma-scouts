package uao.edu.co.scouts_project.finanzas.fees.model.read;
import lombok.AccessLevel;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "member")
@Immutable
@Getter                          // genera todos los getters
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // ctor protegido requerido por JPA
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
}
