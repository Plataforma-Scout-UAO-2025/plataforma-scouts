package uao.edu.co.scouts_project.finanzas.fees.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AccountTest {

  @Test
  void setters_getters_basicos() {
    Account a = new Account();
    a.setAccountId(5L);
    a.setTenantId("org_T");
    a.setMemberId(99L);
    a.setActive(true);
    a.setCurrency("COP");

    assertThat(a.getAccountId()).isEqualTo(5L);
    assertThat(a.getTenantId()).isEqualTo("org_T");
    assertThat(a.getMemberId()).isEqualTo(99L);
    assertThat(a.getCurrency()).isEqualTo("COP");
    assertThat(a.isActive()).isTrue();
  }
}
