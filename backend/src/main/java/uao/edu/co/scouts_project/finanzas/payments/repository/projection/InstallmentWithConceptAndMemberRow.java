package uao.edu.co.scouts_project.finanzas.payments.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InstallmentWithConceptAndMemberRow {
    Long getInstallment_id();
    LocalDate getDue_date();
    BigDecimal getAmount();
    String getStatus();
    String getConcept_name();
    String getConcept_desc();

    // Último pago (si existe)
    String getPayment_id();
    LocalDate getPaid_at();
    String getMethod();
    String getReference();
    Long getPayer_member_id();

    // Datos del miembro
    Long getMember_id();
    String getFirst_name();
    String getLast_name();
    Long getSubgroup_id();
    String getSubgroup_name();
    Long getSection_id();
    String getSection_name();
}
