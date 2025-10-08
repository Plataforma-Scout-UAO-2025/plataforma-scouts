package uao.edu.co.scouts_project.finanzas.payments.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.finanzas.payments.dto.PaymentRecordDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SectionPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SubgroupPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@WebMvcTest(PaymentsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")

class PaymentsControllerMembersTest {

    @Autowired MockMvc mvc;

    @MockitoBean PaymentsService service;

    @Test
    void getMembersByTenant_returns200_andList() throws Exception {
        var p = new PaymentRecordDto();
        p.setMember_id(45L);
        p.setFirst_name("Juan");
        p.setLast_name("Pérez");
        p.setSubgroup(new SubgroupPaymentDto(6L, "Patrulla Tigres"));
        p.setSection(new SectionPaymentDto(4L, "Webelos"));

        when(service.listMembersWithInstallments("org_TENANT"))
            .thenReturn(List.of(p));

        mvc.perform(get("/api/v1/finanzas/payments/members/{tenantId}", "org_TENANT")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$[0].member_id").value(45))
           .andExpect(jsonPath("$[0].subgroup.name").value("Patrulla Tigres"))
           .andExpect(jsonPath("$[0].section.name").value("Webelos"));
    }
}
