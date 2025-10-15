package uao.edu.co.scouts_project.finanzas.fees.data;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.math.BigDecimal;
import java.time.LocalDate;

import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.model.Concept;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;

public final class TestData {
  private static final ObjectMapper om = new ObjectMapper();

  private TestData(){}

  public static CreateCuotaDto createALL(String tenant) {
    return new CreateCuotaDto(
        tenant,
        "Cuota mensual",
        "Descripción",
        new BigDecimal("50000.00"),
        Periodicity.MONTH,
        FeeScope.ALL,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-06-01"),
        null // associated_to
    );
  }

  public static Concept concept(long id, String tenant, String desc, String name) {
    Concept c = new Concept();
    c.setConceptId(id);
    c.setTenantId(tenant);
    c.setDescription(desc);
    c.setName(name);
    return c;
  }

  public static FeePlan feePlan(long id, String tenant, Concept concept) {
    FeePlan fp = new FeePlan();
    fp.setFeePlanId(id);
    fp.setTenantId(tenant);
    fp.setConcept(concept);
    return fp;
  }

  public static CreateCuotaDto createSCOUT(String tenant, Long memberId, String name) {
    ObjectNode at = om.createObjectNode();
    at.put("id", String.valueOf(memberId));
    at.put("name", name);
    return new CreateCuotaDto(
        tenant,
        "Cuota scout",
        "Pago scout",
        new BigDecimal("30000.00"),
        Periodicity.SINGLE,
        FeeScope.SCOUT,
        LocalDate.parse("2025-03-01"),
        LocalDate.parse("2025-03-01"),
        at
    );
  }

  public static Installment installment(long id, String tenant, long accountId, long conceptId) {
    Installment i = new Installment();
    i.setInstallmentId(id);
    i.setTenantId(tenant);
    i.setAccountId(accountId);
    i.setConceptId(conceptId);
    i.setDueDate(LocalDate.now());
    i.setAmount(java.math.BigDecimal.TEN);
    i.setBalance(java.math.BigDecimal.TEN);
    i.setStatus("PENDING");
    i.setPayments(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode());
    return i;
  }

  public static JsonNode associatedTo(Long id, String name) {
    ObjectNode at = om.createObjectNode();
    at.put("id", String.valueOf(id));
    at.put("name", name);
    return at;
  }
}
