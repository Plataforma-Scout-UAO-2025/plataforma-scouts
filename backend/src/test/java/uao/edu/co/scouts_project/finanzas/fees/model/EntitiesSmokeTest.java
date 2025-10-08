package uao.edu.co.scouts_project.finanzas.fees.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.junit.jupiter.api.Test;

class EntitiesSmokeTest {

  @Test
  void account_getters_setters() {
    Account a = new Account();
    a.setAccountId(1L);
    a.setTenantId("org_TENANT");
    a.setMemberId(99L);
    a.setCurrency("COP");
    a.setActive(true);

    assertThat(a.getAccountId()).isEqualTo(1L);
    assertThat(a.getTenantId()).isEqualTo("org_TENANT");
    assertThat(a.getMemberId()).isEqualTo(99L);
    assertThat(a.isActive()).isTrue();
  }

  @Test
  void installment_getters_setters() {
    var om = new ObjectMapper();
    ArrayNode payments = om.createArrayNode();

    Installment i = new Installment();
    i.setInstallmentId(7L);
    i.setTenantId("org_TENANT");
    i.setAccountId(1L);
    i.setConceptId(2L);
    i.setDueDate(LocalDate.parse("2025-01-10"));
    i.setAmount(new BigDecimal("50.00"));
    i.setBalance(new BigDecimal("50.00"));
    i.setStatus("PENDING");
    i.setPayments(payments);

    assertThat(i.getStatus()).isEqualTo("PENDING");
    assertThat(i.getPayments().isArray()).isTrue();
  }
}
