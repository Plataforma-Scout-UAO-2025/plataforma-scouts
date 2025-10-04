package uao.edu.co.scouts_project.finanzas.fees.repository.projection;

public interface MemberHierarchyRow {
  Long getMemberId();
  String getFirstName();
  String getLastName();
  Integer getAge();
  Long getSubgroupId();
  String getSubgroupName();
  Long getSectionId();
  String getSectionName();
  Long getTenantId();
}
