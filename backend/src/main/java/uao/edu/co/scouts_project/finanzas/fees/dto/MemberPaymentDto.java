package uao.edu.co.scouts_project.finanzas.fees.dto;

public record MemberPaymentDto(
    Long member_id,
    String first_name,
    String last_name,
    Long subgroup_id,
    String subgroup_name,
    Long section_id,
    String section_name,
    Integer age
) {}
