package uao.edu.co.scouts_project.finanzas.fees.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

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

    @Test
    void prePersist_inicializa_campos_nulos() {
      Installment i = Installment.builder()
          .tenantId("org_SCOUT")
          .accountId(1L)
          .conceptId(2L)
          .dueDate(LocalDate.of(2025, 10, 30))
          .amount(new BigDecimal("120000"))
          .payments(null)
          .status(null)
          .balance(null)
          .build();

      i.prePersist();

      assertThat(i.getPayments()).isNotNull();
      assertThat(i.getPayments().isArray()).isTrue();
      assertThat(i.getPayments().size()).isZero();

      assertThat(i.getStatus()).isEqualTo("PENDING");
      assertThat(i.getBalance()).isEqualByComparingTo("120000");
    }

    @Test
    void prePersist_no_modifica_valores_existentes() {
      var payments = JsonNodeFactory.instance.arrayNode().add("dummy");
      Installment i = Installment.builder()
          .tenantId("org_SCOUT")
          .accountId(1L)
          .conceptId(2L)
          .dueDate(LocalDate.of(2025, 10, 30))
          .amount(new BigDecimal("120000"))
          .payments(payments)
          .status("PAID")
          .balance(new BigDecimal("50000"))
          .build();

      i.prePersist();

      assertThat(i.getPayments()).isSameAs(payments); // no lo reemplazó
      assertThat(i.getStatus()).isEqualTo("PAID");
      assertThat(i.getBalance()).isEqualByComparingTo("50000");
    }

    @Test
    void constructor_simplificado_asigna_balance_igual_a_amount() {
      Installment i = new Installment(1L, 2L, LocalDate.of(2025, 10, 20), new BigDecimal("80000"));

      // Antes del prePersist, status es null (porque no usaste el builder)
      assertThat(i.getStatus()).isNull();

      // El balance sí se setea por el constructor
      assertThat(i.getBalance()).isEqualByComparingTo(i.getAmount());

      // Simula el ciclo JPA
      i.prePersist();

      // Ahora sí: status PENDING por la lógica de @PrePersist
      assertThat(i.getStatus()).isEqualTo("PENDING");
    }
    
}

