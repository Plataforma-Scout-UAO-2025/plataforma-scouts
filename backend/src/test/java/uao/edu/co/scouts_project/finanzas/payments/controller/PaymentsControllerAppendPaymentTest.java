package uao.edu.co.scouts_project.finanzas.payments.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uao.edu.co.scouts_project.finanzas.payments.config.PaymentsExceptionHandler;
import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.service.PaymentsService;

@ExtendWith(MockitoExtension.class)
class PaymentsControllerAppendPaymentTest {

    private MockMvc mvc;
    private ObjectMapper om;

    @Mock
    PaymentsService service;

    @InjectMocks
    PaymentsController controller;

    @BeforeEach
    void setup() {
        om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new PaymentsExceptionHandler())
                .build();
    }

    @Test
    void appendPayment_returns201_andEchoBody() throws Exception {
        var body = new AppendPaymentDto();
        body.setPayment_id("0aa9698a-92c0-4fa7-955c-043690822ae9");
        body.setInstallment_id(3L);
        body.setPayer_member_id(1L);
        body.setPaid_at(LocalDate.of(2025, 10, 23));
        body.setMethod("PSE");
        body.setReference("asdas");
        body.setAmount(new BigDecimal("60000"));

        // Importante: no usar eq(body) porque Spring deserializa a otra instancia
        doNothing().when(service).appendPayment(eq("org_TENANT"), eq(3L), any(AppendPaymentDto.class));

        mvc.perform(post("/api/v1/finanzas/payments/{tenantId}/installments/{installmentId}/payments", "org_TENANT", 3L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(body)))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.payment_id").value("0aa9698a-92c0-4fa7-955c-043690822ae9"))
           .andExpect(jsonPath("$.installment_id").value(3));
    }

    @Test
    void appendPayment_duplicate_returns409() throws Exception {
        var body = new AppendPaymentDto();
        body.setPayment_id("dup-id");
        body.setInstallment_id(3L);

        // Lanzar 409 cuando el payment_id sea "dup-id"
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Installment not found or payment_id already exists"))
                .when(service)
                .appendPayment(eq("org_TENANT"), eq(3L),
                        argThat(dto -> dto != null && "dup-id".equals(dto.getPayment_id())));

        mvc.perform(post("/api/v1/finanzas/payments/{tenantId}/installments/{installmentId}/payments", "org_TENANT", 3L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(body)))
           .andExpect(status().isConflict())
           .andExpect(jsonPath("$.status").value(409))
           .andExpect(jsonPath("$.message").value("Installment not found or payment_id already exists"));
    }
}
