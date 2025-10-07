package uao.edu.co.scouts_project.finanzas.payments.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.finanzas.payments.dto.CuotasEstadoDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.MemberDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@WebMvcTest(PaymentsController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PaymentsControllerStatusTest {

    @Autowired MockMvc mvc;

    @MockitoBean PaymentsService service;

    private static EstadoCuentaDto buildGlobalDto(boolean includeMembers) {
        var cuota = new CuotasEstadoDto();
        cuota.setInstallment_id(10L);
        cuota.setName("Matrícula 2025");
        cuota.setAmount(new BigDecimal("120000"));
        cuota.setDue_date(LocalDate.of(2025, 10, 31));
        cuota.setStatus("PENDING");
        cuota.setMember_name("Juan Pérez");

        var dto = new EstadoCuentaDto();
        dto.setKpis(new EstadoCuentaDto.KpisDto(
                new BigDecimal("120000"), // totalPendiente (mes)
                new BigDecimal("0"),      // totalPagado
                0L                         // cuotasVencidas
        ));
        dto.setCuotas(List.of(cuota));
        if (includeMembers) {
            var m = new MemberDto();
            m.setMember_id(45L);
            m.setMember_name("Juan Pérez");
            m.setSubgroup(new MemberDto.IdNameDto(6L, "Patrulla Tigres"));
            m.setSection(new MemberDto.IdNameDto(4L, "Webelos"));
            dto.setMembers(List.of(m));
        } else {
            dto.setMembers(null);
        }
        return dto;
    }

    @Test
    void getStatus_treasurer_returns200_andGlobalArray() throws Exception {
        var dto = buildGlobalDto(false);
        when(service.listAccountStatusForTenant("org_TENANT"))
            .thenReturn(List.of(dto));

        mvc.perform(get("/api/v1/finanzas/payments/status/{tenantId}", "org_TENANT")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].kpis.totalPendiente").value(120000))
           .andExpect(jsonPath("$[0].members").doesNotExist()); // debe venir null
    }

    @Test
    void getStatus_guardian_returns200_andMembersArray() throws Exception {
        var dto = buildGlobalDto(true);
        when(service.listAccountStatusForGuardian("org_TENANT", 1001L))
            .thenReturn(List.of(dto));

        mvc.perform(get("/api/v1/finanzas/payments/status/{tenantId}/{guardianId}", "org_TENANT", 1001L)
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].members[0].member_id").value(45))
           .andExpect(jsonPath("$[0].cuotas[0].name").value("Matrícula 2025"));
    }
}
