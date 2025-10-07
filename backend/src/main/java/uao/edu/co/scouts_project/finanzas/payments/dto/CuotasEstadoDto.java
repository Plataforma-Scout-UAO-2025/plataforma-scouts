package uao.edu.co.scouts_project.finanzas.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CuotasEstadoDto {
    private Long installment_id;
    private String name;
    private BigDecimal amount;
    private LocalDate due_date;
    private String status;
    private LocalDate paid_at;
    private String method;
    private String reference;
    private String payment_id;
    private String member_name;

    public Long getInstallment_id() { return installment_id; }
    public void setInstallment_id(Long installment_id) { this.installment_id = installment_id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDue_date() { return due_date; }
    public void setDue_date(LocalDate due_date) { this.due_date = due_date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getPaid_at() { return paid_at; }
    public void setPaid_at(LocalDate paid_at) { this.paid_at = paid_at; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getPayment_id() { return payment_id; }
    public void setPayment_id(String payment_id) { this.payment_id = payment_id; }
    public String getMember_name() { return member_name; }
    public void setMember_name(String member_name) { this.member_name = member_name; }
}
