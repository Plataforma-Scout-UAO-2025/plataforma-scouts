package uao.edu.co.scouts_project.finanzas.payments.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.core.Authentication;

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
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new PaymentsExceptionHandler())
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
    // Tesorero
    var dto = buildGlobalDto(false);
    when(service.listAccountStatusForTenant("org_TENANT"))
            .thenReturn(java.util.List.of(dto));

    mvc.perform(get("/api/v1/finanzas/payments/status/{tenantId}", "org_TENANT")
            .accept(MediaType.APPLICATION_JSON))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.kpis.totalPendiente").value(120000))
    .andExpect(jsonPath("$.kpis.totalPagado").value(0))
    .andExpect(jsonPath("$.kpis.cuotasVencidas").value(0))
    // si serializas "members": null
    .andExpect(jsonPath("$.members").doesNotExist()); // o nullValue() si lo incluyes como null
    }

    @Test
    void getStatus_guardian_returns200_andFirstElementOfServiceList() throws Exception {
        // --- Arrange ---
        final String tenantId = "org_TENANT";
        final String userId   = "user-123";
        final Long guardianId = 42L;

        // Ponemos un Authentication en el SecurityContext, porque el controller usa getAuthentication().getName()
        Authentication auth = new UsernamePasswordAuthenticationToken(userId, "N/A");
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            // Simulamos el flujo del controller:
            // 1) resolver guardianId desde el userId del SecurityContext
            when(service.getGuardianIdFromUserId(userId)).thenReturn(guardianId);

            // 2) devolver una lista con 2 elementos, el controller retorna list.get(0)
            var first = buildGlobalDto(true);   // incluye members[]
            var second = buildGlobalDto(true);  // otro elemento que NO debería regresar
            when(service.listAccountStatusForGuardian(tenantId, guardianId))
                    .thenReturn(List.of(first, second));

            // --- Act & Assert ---
            mvc.perform(get("/api/v1/finanzas/payments/status/guardian/{tenantId}", tenantId)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            // KPIs del primer elemento
            .andExpect(jsonPath("$.kpis.totalPendiente").value(120000))
            .andExpect(jsonPath("$.kpis.totalPagado").value(0))
            .andExpect(jsonPath("$.kpis.cuotasVencidas").value(0))
            // Verificamos que vengan members[] (caso guardian)
            .andExpect(jsonPath("$.members[0].member_id").value(45))
            .andExpect(jsonPath("$.members[0].member_name").value("Juan Pérez"))
            .andExpect(jsonPath("$.members[0].subgroup.id").value(6))
            .andExpect(jsonPath("$.members[0].subgroup.name").value("Patrulla Tigres"))
            .andExpect(jsonPath("$.members[0].section.id").value(4))
            .andExpect(jsonPath("$.members[0].section.name").value("Webelos"))
            // Un par de checks de cuotas para asegurar que es el objeto esperado
            .andExpect(jsonPath("$.cuotas[0].name").value("Matrícula 2025"))
            .andExpect(jsonPath("$.cuotas[0].status").value("PENDING"));
        } finally {
            // Limpieza del SecurityContext para no afectar otros tests
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void getStatus_guardian_emptyList_resultsIn5xx_byCurrentBehavior() throws Exception {
        // --- Arrange ---
        final String tenantId = "org_TENANT";
        final String userId   = "user-123";
        final Long guardianId = 42L;

        Authentication auth = new UsernamePasswordAuthenticationToken(userId, "N/A");
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            when(service.getGuardianIdFromUserId(userId)).thenReturn(guardianId);
            // El controller hace list.get(0) sin validar -> IndexOutOfBoundsException -> 5xx por el @ControllerAdvice actual
            when(service.listAccountStatusForGuardian(tenantId, guardianId)).thenReturn(List.of());

            mvc.perform(get("/api/v1/finanzas/payments/status/guardian/{tenantId}", tenantId)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is5xxServerError());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

}
