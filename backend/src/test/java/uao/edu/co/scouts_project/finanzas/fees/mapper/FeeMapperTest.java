package uao.edu.co.scouts_project.finanzas.fees.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;
import uao.edu.co.scouts_project.finanzas.fees.model.Concept;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.MemberHierarchyRow;
import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;

class FeeMapperTest {

  FeeMapper mapper = new FeeMapper();
  ObjectMapper om = new ObjectMapper();

  @Test
  void toMemberDto_fromMemberView() {
    MemberView v = new MemberView() {
      public Long getMemberId(){return 1L;}
      public String getFirstName(){return "A";}
      public String getLastName(){return "B";}
      public Long getSubgroup(){return 11L;}
      public Integer getAge(){return 9;}
    };
    var out = mapper.toMemberDto(v);
    assertThat(out.member_id()).isEqualTo(1L);
    assertThat(out.subgroup_id()).isEqualTo(11L);
    // section_* son null en MemberView
    assertThat(out.section_id()).isNull();
  }

  @Test
  void toMemberDto_fromHierarchy() {
    MemberHierarchyRow r = new MemberHierarchyRow() {
      public Long getMemberId(){return 5L;}
      public String getFirstName(){return "X";}
      public String getLastName(){return "Y";}
      public Long getSubgroupId(){return 33L;}
      public String getSubgroupName(){return "Castores";}
      public Long getSectionId(){return 44L;}
      public String getSectionName(){return "Manada";}
      public Integer getAge(){return 12;}
      public String getTenantId(){return "org_TENANT";}
    };
    var out = mapper.toMemberDto(r);
    assertThat(out.section_name()).isEqualTo("Manada");
    assertThat(out.subgroup_name()).isEqualTo("Castores");
  }

  @Test
  void toCuotaDto_overloads() {
    Concept c = new Concept();
    c.setName("Concept");
    c.setDescription("Desc");

    FeePlan fp = new FeePlan();
    fp.setFeePlanId(77L);
    fp.setAmount(new BigDecimal("10.00"));
    fp.setPeriodicity("MONTH");
    fp.setScope("SCOUT");
    fp.setStartDate(LocalDate.parse("2025-01-01"));
    fp.setEndDate(LocalDate.parse("2025-02-01"));
    fp.setConcept(c);

    ObjectNode at = om.createObjectNode();
    at.put("id", "9"); at.put("name", "N");
    fp.setAssociatedTo(at);

    // (1) principal
    CuotaDto d1 = mapper.toCuotaDto(fp, (MemberPaymentDto) null);
    assertThat(d1.name()).isEqualTo("Concept");
    assertThat(d1.associated_to().get("id").asText()).isEqualTo("9");

    // (2) overload con MemberView
    MemberView mv = new MemberView() {
      public Long getMemberId(){return 9L;}
      public String getFirstName(){return "N"; }
      public String getLastName(){return "L"; }
      public Long getSubgroup(){return 1L;}
      public Integer getAge(){return 1;}
    };
    CuotaDto d2 = mapper.toCuotaDto(fp, mv);
    assertThat(d2.scope()).isEqualTo("SCOUT");

    // (3) overload sin miembro
    CuotaDto d3 = mapper.toCuotaDto(fp);
    assertThat(d3.periodicity()).isEqualTo("MONTH");
  }
}
