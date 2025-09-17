package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity @Table(name="sections")
public class Section {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name="section_id") private Long id;
  @Column(name="tenant_id",nullable=false) private Integer tenantId;
  @NotBlank @Size(max=50) @Column(name="standard_name",nullable=false,length=50) private String standardName;
  @Size(max=100) @Column(name="group_specific_name",length=100) private String groupSpecificName;
  @Column(name="program_description") private String programDescription;
  @Column(name="section_logo_url",length=255) private String sectionLogoUrl;
  @Column(name="section_flag_url",length=255) private String sectionFlagUrl;
  @Column(name="section_yell") private String sectionYell;
  @Column(name="call_method",length=100) private String callMethod;
  @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt = Instant.now();

  public Section() {}
  public Section(Integer tenantId, String standardName, String groupSpecificName){
    this.tenantId=tenantId; this.standardName=standardName; this.groupSpecificName=groupSpecificName;
  }
  public Long getId(){ return id; }
  public Integer getTenantId(){ return tenantId; }
  public void setTenantId(Integer v){ this.tenantId=v; }
  public String getStandardName(){ return standardName; }
  public void setStandardName(String v){ this.standardName=v; }
  public String getGroupSpecificName(){ return groupSpecificName; }
  public void setGroupSpecificName(String v){ this.groupSpecificName=v; }
  public String getProgramDescription(){ return programDescription; }
  public void setProgramDescription(String v){ this.programDescription=v; }
  public String getSectionLogoUrl(){ return sectionLogoUrl; }
  public void setSectionLogoUrl(String v){ this.sectionLogoUrl=v; }
  public String getSectionFlagUrl(){ return sectionFlagUrl; }
  public void setSectionFlagUrl(String v){ this.sectionFlagUrl=v; }
  public String getSectionYell(){ return sectionYell; }
  public void setSectionYell(String v){ this.sectionYell=v; }
  public String getCallMethod(){ return callMethod; }
  public void setCallMethod(String v){ this.callMethod=v; }
  public Instant getCreatedAt(){ return createdAt; }
}
