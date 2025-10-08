package uao.edu.co.scouts_project.finanzas.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AppendPaymentDto {
    private String payment_id;      
    private Long installment_id;    
    private Long payer_member_id;   // puede ser null
    private LocalDate paid_at;      // "YYYY-MM-DD"
    private String method;          // PSE, CASH, etc.
    private String reference;       // ref externa
    private BigDecimal amount;      

    // getters/setters
    public String getPayment_id() { return payment_id; }
    public void setPayment_id(String payment_id) { this.payment_id = payment_id; }
    public Long getInstallment_id() { return installment_id; }
    public void setInstallment_id(Long installment_id) { this.installment_id = installment_id; }
    public Long getPayer_member_id() { return payer_member_id; }
    public void setPayer_member_id(Long payer_member_id) { this.payer_member_id = payer_member_id; }
    public LocalDate getPaid_at() { return paid_at; }
    public void setPaid_at(LocalDate paid_at) { this.paid_at = paid_at; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
