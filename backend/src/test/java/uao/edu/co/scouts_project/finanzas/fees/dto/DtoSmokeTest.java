package uao.edu.co.scouts_project.finanzas.fees.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;

class DtoSmokeTest {

  private final ObjectMapper om = new ObjectMapper();

  @Test
  void createCuotaDto_all_fields() {
    ObjectNode at = om.createObjectNode();
    at.put("id", "123");
    at.put("name", "Algo");

    CreateCuotaDto dto = new CreateCuotaDto(
        "org_TENANT",
        "Cuota X",
        "Desc",
        new BigDecimal("100.50"),
        Periodicity.MONTH,
        FeeScope.SCOUT,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-06-01"),
        at
    );

    assertThat(dto.tenant_id()).isEqualTo("org_TENANT");
    assertThat(dto.name()).isEqualTo("Cuota X");
    assertThat(dto.amount()).isEqualByComparingTo("100.50");
    assertThat(dto.periodicity()).isEqualTo(Periodicity.MONTH);
    assertThat(dto.scope()).isEqualTo(FeeScope.SCOUT);
    assertThat(dto.associated_to().get("name").asText()).isEqualTo("Algo");
  }

  @Test
  void cuotaDto_all_fields() {
    var at = om.createObjectNode();
    at.put("id", "1");
    at.put("name", "N");
    CuotaDto dto = new CuotaDto(
        10L,
        new BigDecimal("50"),
        "Concept",
        "Desc",
        "MONTH",
        "ALL",
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-06-01"),
        at
    );
    assertThat(dto.fee_id()).isEqualTo(10L);
    assertThat(dto.name()).isEqualTo("Concept");
    assertThat(dto.associated_to().get("id").asText()).isEqualTo("1");
  }

  @Test
  void memberPaymentDto_all_fields() {
    MemberPaymentDto m = new MemberPaymentDto(
        1L, "A", "B", 11L, "Sub", 22L, "Sec", 9
    );
    assertThat(m.member_id()).isEqualTo(1L);
    assertThat(m.subgroup_name()).isEqualTo("Sub");
  }

  @Test
  void idNameDto_all_fields() {
    IdNameDto p = new IdNameDto(7L, "Nombre");
    assertThat(p.id()).isEqualTo(7L);
    assertThat(p.name()).isEqualTo("Nombre");
  }
}
