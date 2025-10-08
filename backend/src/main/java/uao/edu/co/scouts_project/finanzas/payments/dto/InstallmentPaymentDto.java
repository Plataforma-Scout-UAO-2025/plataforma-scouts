package uao.edu.co.scouts_project.finanzas.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InstallmentPaymentDto {
    private Long installment_id;
    private String name;          // concept.name
    private String description;   // concept.description
    private LocalDate due_date;
    private BigDecimal amount;
    private String status;

    // Campos de pago (por ahora null si no se explota JSONB payments)
    private String payment_id;
    private LocalDate paid_at;
    private String method;
    private String reference;
    private Long payer_member_id;

    // getters/setters
    public Long getInstallment_id() { return installment_id; }
    public void setInstallment_id(Long installment_id) { this.installment_id = installment_id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDue_date() { return due_date; }
    public void setDue_date(LocalDate due_date) { this.due_date = due_date; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPayment_id() { return payment_id; }
    public void setPayment_id(String payment_id) { this.payment_id = payment_id; }
    public LocalDate getPaid_at() { return paid_at; }
    public void setPaid_at(LocalDate paid_at) { this.paid_at = paid_at; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Long getPayer_member_id() { return payer_member_id; }
    public void setPayer_member_id(Long payer_member_id) { this.payer_member_id = payer_member_id; }
}
