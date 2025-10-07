package uao.edu.co.scouts_project.finanzas.fees.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.junit.jupiter.api.Test;

class InstallmentTest {

  @Test
  void setters_getters_basicos() {
    Installment inst = new Installment(1L, 2L, LocalDate.parse("2025-01-01"), new BigDecimal("10.00"));
    inst.setTenantId("org_T");
    inst.setStatus("PENDING");
    inst.setBalance(new BigDecimal("10.00"));

    ArrayNode arr = new ObjectMapper().createArrayNode();
    inst.setPayments(arr);

    assertThat(inst.getAccountId()).isEqualTo(1L);
    assertThat(inst.getConceptId()).isEqualTo(2L);
    assertThat(inst.getDueDate()).isEqualTo(LocalDate.parse("2025-01-01"));
    assertThat(inst.getAmount()).isEqualByComparingTo("10.00");
    assertThat(inst.getBalance()).isEqualByComparingTo("10.00");
    assertThat(inst.getStatus()).isEqualTo("PENDING");
    assertThat(inst.getTenantId()).isEqualTo("org_T");
    assertThat(inst.getPayments()).isSameAs(arr);
  }
}

