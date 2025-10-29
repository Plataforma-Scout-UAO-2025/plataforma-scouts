package uao.edu.co.scouts_project.statistics.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersCountDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StatisticsControllerTest {

    @Mock
    private GroupStatisticsService groupStatisticsService;

    @InjectMocks
    private StatisticsController statisticsController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getTopGroupsByMembers_shouldReturnUnauthorizedWhenNoHeader() {
        ResponseEntity<?> resp = statisticsController.getTopGroupsByMembers("t1", null);
        assertEquals(HttpStatus.UNAUTHORIZED, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Missing X-Tenant-Id"));
    }

    @Test
    void getTopGroupsByMembers_shouldReturnForbiddenOnTenantMismatch() {
        ResponseEntity<?> resp = statisticsController.getTopGroupsByMembers("t1", "other");
        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
    }

    @Test
    void getTopGroupsByMembers_shouldReturnOkWithData() {
        List<GroupMembersCountDTO> data = List.of(new GroupMembersCountDTO(1L, "G1", 5L));
        when(groupStatisticsService.getTopGroupsByMembers("t1", 5)).thenReturn(data);

        ResponseEntity<?> resp = statisticsController.getTopGroupsByMembers("t1", "t1");

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof List);
        verify(groupStatisticsService, times(1)).getTopGroupsByMembers("t1", 5);
    }

    @Test
    void getGroupStatistics_shouldPropagateServiceStatusException() {
        when(groupStatisticsService.getGroupStatistics("t1")).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        ResponseEntity<?> resp = statisticsController.getGroupStatistics("t1", "t1");

        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Tenant no encontrado"));
    }

    @Test
    void getMembersByGroup_shouldReturnOkAndList() {
        List<GroupMembersDTO> data = List.of(new GroupMembersDTO(1L, "G1", 2L));
        when(groupStatisticsService.getMembersByGroup("t1")).thenReturn(data);

        ResponseEntity<Object> resp = statisticsController.getMembersByGroup("t1", "t1");

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof List);
        verify(groupStatisticsService).getMembersByGroup("t1");
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnUnauthorizedWhenNoHeader() {
        ResponseEntity<?> resp = statisticsController.getInactiveGroupStatistics("t1", null);
        assertEquals(HttpStatus.UNAUTHORIZED, resp.getStatusCode());
    }

    @Test
    void getTopGroupsByMembers_shouldReturnInternalServerOnUnexpectedException() {
        when(groupStatisticsService.getTopGroupsByMembers("t1", 5)).thenThrow(new RuntimeException("boom"));

        ResponseEntity<?> resp = statisticsController.getTopGroupsByMembers("t1", "t1");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }

    @Test
    void getGroupStatistics_shouldReturnInternalServerOnUnexpectedException() {
        when(groupStatisticsService.getGroupStatistics("t1")).thenThrow(new RuntimeException("boom"));

        ResponseEntity<?> resp = statisticsController.getGroupStatistics("t1", "t1");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }

    @Test
    void getMembersByGroup_shouldReturnInternalServerOnUnexpectedException() {
        when(groupStatisticsService.getMembersByGroup("t1")).thenThrow(new RuntimeException("boom"));

        ResponseEntity<Object> resp = statisticsController.getMembersByGroup("t1", "t1");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnInternalServerOnUnexpectedException() {
        when(groupStatisticsService.getInactiveGroupStatistics("t1")).thenThrow(new RuntimeException("boom"));

        ResponseEntity<?> resp = statisticsController.getInactiveGroupStatistics("t1", "t1");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }
}
