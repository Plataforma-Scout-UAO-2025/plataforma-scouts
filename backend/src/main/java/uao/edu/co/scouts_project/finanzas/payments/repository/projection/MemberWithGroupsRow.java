package uao.edu.co.scouts_project.finanzas.payments.repository.projection;

public interface MemberWithGroupsRow {
    Long getMember_id();
    String getFirst_name();
    String getLast_name();
    Integer getAge();
    Long getSubgroup_id();
    String getSubgroup_name();
    Long getSection_id();
    String getSection_name();
}
