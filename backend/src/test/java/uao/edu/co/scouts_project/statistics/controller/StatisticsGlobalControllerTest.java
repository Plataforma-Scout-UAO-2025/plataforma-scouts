package uao.edu.co.scouts_project.statistics.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import uao.edu.co.scouts_project.statistics.dto.TotalMembersDTO;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StatisticsGlobalControllerTest {

    @Mock
    private MemberStatisticsService memberStatisticsService;

    @InjectMocks
    private StatisticsGlobalController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getTotalMembers_shouldReturnOk() {
        when(memberStatisticsService.getTotalMembers()).thenReturn(new TotalMembersDTO(123L));

        ResponseEntity<?> resp = controller.getTotalMembers();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof TotalMembersDTO);
    }

    @Test
    void getTotalMembers_shouldReturnInternalServerOnException() {
        when(memberStatisticsService.getTotalMembers()).thenThrow(new RuntimeException("db"));

        ResponseEntity<?> resp = controller.getTotalMembers();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }
}
