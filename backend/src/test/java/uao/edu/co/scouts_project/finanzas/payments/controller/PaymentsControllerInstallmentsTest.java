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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uao.edu.co.scouts_project.finanzas.payments.config.PaymentsExceptionHandler;
import uao.edu.co.scouts_project.finanzas.payments.dto.InstallmentPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@ExtendWith(MockitoExtension.class)
class PaymentsControllerInstallmentsTest {

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

    @Test
    void getInstallmentsByMember_returns200_andList() throws Exception {
        var i1 = new InstallmentPaymentDto();
        i1.setInstallment_id(3L);
        i1.setName("Test Sub");
        i1.setDescription("Trimestral");
        i1.setDue_date(LocalDate.of(2026, 1, 6));
        i1.setAmount(new BigDecimal("15000"));
        i1.setStatus("PENDING");

        var i2 = new InstallmentPaymentDto();
        i2.setInstallment_id(2L);
        i2.setName("Test Sub");
        i2.setDescription("Trimestral");
        i2.setDue_date(LocalDate.of(2025, 10, 6));
        i2.setAmount(new BigDecimal("15000"));
        i2.setStatus("PENDING");

        when(service.listInstallmentsByMember("org_TENANT", 45L))
            .thenReturn(List.of(i1, i2));

        mvc.perform(get("/api/v1/finanzas/payments/installments/{tenantId}/{member_id}", "org_TENANT", 45L)
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
           .andExpect(jsonPath("$[0].installment_id").value(3))
           .andExpect(jsonPath("$[0].name").value("Test Sub"))
           .andExpect(jsonPath("$[0].status").value("PENDING"))
           .andExpect(jsonPath("$[1].installment_id").value(2));
    }
}
