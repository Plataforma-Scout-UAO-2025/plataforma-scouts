package uao.edu.co.scouts_project.finanzas.payments.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InstallmentWithConceptRow {
    Long getInstallment_id();
    LocalDate getDue_date();
    BigDecimal getAmount();
    String getStatus();
    String getConcept_name();
    String getConcept_desc();
}
