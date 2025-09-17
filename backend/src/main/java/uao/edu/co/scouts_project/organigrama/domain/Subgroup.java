package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity @Table(name="subgroups")
public class Subgroup {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name="subgroup_id") private Long id;
  @Column(name="tenant_id",nullable=false) private Integer tenantId;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="section_id",nullable=false) private Section section;
  @NotBlank @Size(max=100) @Column(name="subgroup_name",nullable=false) private String subgroupName;
  @Size(max=50) @Column(name="subgroup_type") private String subgroupType;
  @Column(name="creation_date") private LocalDate creationDate;
  @Column(name="is_active") private Boolean active = Boolean.TRUE;

  public Long getId(){ return id; }
  public Integer getTenantId(){ return tenantId; }
  public void setTenantId(Integer v){ this.tenantId=v; }
  public Section getSection(){ return section; }
  public void setSection(Section v){ this.section=v; }
  public String getSubgroupName(){ return subgroupName; }
  public void setSubgroupName(String v){ this.subgroupName=v; }
  public String getSubgroupType(){ return subgroupType; }
  public void setSubgroupType(String v){ this.subgroupType=v; }
  public LocalDate getCreationDate(){ return creationDate; }
  public void setCreationDate(LocalDate v){ this.creationDate=v; }
  public Boolean getActive(){ return active; }
  public void setActive(Boolean v){ this.active=v; }
}
