package uao.edu.co.scouts_project.finanzas.payments.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import uao.edu.co.scouts_project.finanzas.payments.config.PaymentsExceptionHandler;
import uao.edu.co.scouts_project.finanzas.payments.dto.CuotasEstadoDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.MemberDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@ExtendWith(MockitoExtension.class)
class PaymentsControllerStatusTest {

    private MockMvc mvc;

    @Mock
    PaymentsService service;

    @InjectMocks
    PaymentsController controller;

    @BeforeEach
    void setup() {
        // Configurar Jackson igual que la app (snake_case + java.time)
        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        om.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

        MappingJackson2HttpMessageConverter jackson = new MappingJackson2HttpMessageConverter(om);

        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new PaymentsExceptionHandler())
                .setMessageConverters(jackson) // <--- clave para snake_case en standalone
                .build();
    }

    // ---------- HELPERS ----------
    private EstadoCuentaDto buildGlobalDto(boolean includeMembers) {
        var kpis = new EstadoCuentaDto.KpisDto(new BigDecimal("120000"), BigDecimal.ZERO, 0L);

        var cuota = new CuotasEstadoDto();
        cuota.setInstallment_id(1L);
        cuota.setName("Matrícula 2025");
        cuota.setAmount(new BigDecimal("120000"));
        cuota.setDue_date(LocalDate.now().withDayOfMonth(1));
        cuota.setStatus("PENDING");
        cuota.setPayment_id(null);
        cuota.setPaid_at(null);
        cuota.setMethod(null);
        cuota.setReference(null);
        cuota.setMember_name("Juan Pérez");

        var dto = new EstadoCuentaDto();
        dto.setKpis(kpis);
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

    // ---------- TESTS ----------
    @Test
    void getStatus_treasurer_returns200_andGlobalObject() throws Exception {
        var dto = buildGlobalDto(false);
        // EN ESTA RAMA el servicio/controlador devuelven LISTA
        when(service.listAccountStatusForTenant("org_TENANT")).thenReturn(List.of(dto));

        mvc.perform(get("/api/v1/finanzas/payments/status/{tenantId}", "org_TENANT")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].kpis.total_pendiente").value(120000))
           .andExpect(jsonPath("$[0].kpis.total_pagado").value(0))
           .andExpect(jsonPath("$[0].kpis.cuotas_vencidas").value(0))
           .andExpect(jsonPath("$[0].members").value(Matchers.nullValue()));
    }

    @Test
    void getStatus_guardian_returns200_andMembersArray() throws Exception {
        var dto = buildGlobalDto(true);
        when(service.listAccountStatusForGuardian("org_TENANT", 1001L)).thenReturn(List.of(dto));

        mvc.perform(get("/api/v1/finanzas/payments/status/{tenantId}/{guardianId}", "org_TENANT", 1001L)
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].members[0].member_id").value(45))
           .andExpect(jsonPath("$[0].cuotas[0].name").value("Matrícula 2025"));
    }
}
