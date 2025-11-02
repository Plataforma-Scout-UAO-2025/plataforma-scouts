package uao.edu.co.scouts_project.statistics.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import uao.edu.co.scouts_project.statistics.dto.*;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StatisticsGlobalControllerTest {

    @Mock
    private MemberStatisticsService memberStatisticsService;

    @Mock
    private GroupStatisticsService groupStatisticsService;

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

    @Test
    void getGroupStatistics_shouldReturnOk() {
        GroupStatisticsDTO dto = new GroupStatisticsDTO(5L);
        when(groupStatisticsService.getGroupStatistics()).thenReturn(dto);

        ResponseEntity<?> resp = controller.getGroupStatistics();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof GroupStatisticsDTO);
        assertEquals(5L, ((GroupStatisticsDTO) resp.getBody()).activeGroupsCount());
    }

    @Test
    void getGroupStatistics_shouldHandleError() {
        when(groupStatisticsService.getGroupStatistics()).thenThrow(new RuntimeException("error"));

        ResponseEntity<?> resp = controller.getGroupStatistics();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(((Map<?, ?>) resp.getBody()).get("message").toString().contains("Ha ocurrido un error interno"));
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnOk() {
        InactiveGroupStatisticsDTO dto = new InactiveGroupStatisticsDTO(3L);
        when(groupStatisticsService.getInactiveGroupStatistics()).thenReturn(dto);

        ResponseEntity<?> resp = controller.getInactiveGroupStatistics();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof InactiveGroupStatisticsDTO);
        assertEquals(3L, ((InactiveGroupStatisticsDTO) resp.getBody()).inactiveGroupsCount());
    }

    @Test
    void getMembersByGroup_shouldReturnOk() {
        GroupMembersDTO dto = new GroupMembersDTO(1L, "Test Group", 10L);
        when(groupStatisticsService.getMembersByGroup()).thenReturn(Arrays.asList(dto));

        ResponseEntity<?> resp = controller.getMembersByGroup();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof List);
        List<?> result = (List<?>) resp.getBody();
        assertFalse(result.isEmpty());
        assertTrue(result.get(0) instanceof GroupMembersDTO);
    }

    @Test
    void getTopGroupsByMembers_shouldReturnOk() {
        GroupMembersCountDTO dto = new GroupMembersCountDTO(1L, "Test Group", 10L);
        when(groupStatisticsService.getTopGroupsByMembers(10)).thenReturn(Arrays.asList(dto));

        ResponseEntity<?> resp = controller.getTopGroupsByMembers();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody() instanceof List);
        List<?> result = (List<?>) resp.getBody();
        assertFalse(result.isEmpty());
        assertTrue(result.get(0) instanceof GroupMembersCountDTO);
    }
}

