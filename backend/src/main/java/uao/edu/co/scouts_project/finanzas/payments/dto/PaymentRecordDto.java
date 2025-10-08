package uao.edu.co.scouts_project.finanzas.payments.dto;

import java.util.ArrayList;
import java.util.List;

public class PaymentRecordDto {
    private Long member_id;
    private String first_name;
    private String last_name;
    private Integer age;
    private SubgroupPaymentDto subgroup;
    private SectionPaymentDto section;

    private List<InstallmentPaymentDto> installment = new ArrayList<>();

    public Long getMember_id() { return member_id; }
    public void setMember_id(Long member_id) { this.member_id = member_id; }
    public String getFirst_name() { return first_name; }
    public void setFirst_name(String first_name) { this.first_name = first_name; }
    public String getLast_name() { return last_name; }
    public void setLast_name(String last_name) { this.last_name = last_name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public SubgroupPaymentDto getSubgroup() { return subgroup; }
    public void setSubgroup(SubgroupPaymentDto subgroup) { this.subgroup = subgroup; }
    public SectionPaymentDto getSection() { return section; }
    public void setSection(SectionPaymentDto section) { this.section = section; }
    public List<InstallmentPaymentDto> getInstallment() { return installment; }
    public void setInstallment(List<InstallmentPaymentDto> installment) { this.installment = installment; }
}
