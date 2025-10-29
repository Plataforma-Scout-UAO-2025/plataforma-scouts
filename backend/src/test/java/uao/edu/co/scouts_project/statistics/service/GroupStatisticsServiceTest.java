package uao.edu.co.scouts_project.statistics.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersCountDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupStatisticsDTO;
import uao.edu.co.scouts_project.statistics.dto.InactiveGroupStatisticsDTO;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GroupStatisticsServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private IMemberRepository memberRepository;

    @InjectMocks
    private GroupStatisticsService groupStatisticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getGroupStatistics_shouldReturnCounts_whenTenantExists() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(groupRepository.countByTenantIdAndIsActiveTrue(tenantId)).thenReturn(3L);

        GroupStatisticsDTO result = groupStatisticsService.getGroupStatistics(tenantId);

        assertNotNull(result);
        assertEquals(3L, result.activeGroupsCount());
    }

    @Test
    void getGroupStatistics_shouldThrowNotFound_whenTenantDoesNotExist() {
        String tenantId = "missing";
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> groupStatisticsService.getGroupStatistics(tenantId));
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnCounts_whenTenantExists() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(groupRepository.countByTenantIdAndIsActiveFalse(tenantId)).thenReturn(2L);

        InactiveGroupStatisticsDTO dto = groupStatisticsService.getInactiveGroupStatistics(tenantId);

        assertNotNull(dto);
        assertEquals(2L, dto.inactiveGroupsCount());
    }

    @Test
    void getMembersByGroup_shouldReturnList_whenTenantExists() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

        List<GroupMembersDTO> expected = List.of(new GroupMembersDTO(1L, "Grupo A", 5L));

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(memberRepository.countMembersByGroup(tenantId)).thenReturn(expected);

        List<GroupMembersDTO> result = groupStatisticsService.getMembersByGroup(tenantId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Grupo A", result.get(0).groupName());
    }

    @Test
    void getTopGroupsByMembers_shouldMapRowsToDTOs_andUseGroupNameOrDefault() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

        // Simular filas: {groupId, count}
        List<Object[]> rows = List.of(new Object[]{1L, 10L}, new Object[]{2L, 4L});

        Group g1 = new Group();
        g1.setGroupId(1L);
        g1.setName("Grupo Test");

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(memberRepository.countMembersByGroupIdByTenant(tenantId)).thenReturn(rows);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(g1));
        when(groupRepository.findById(2L)).thenReturn(Optional.empty());

        List<GroupMembersCountDTO> result = groupStatisticsService.getTopGroupsByMembers(tenantId, 5);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Grupo Test", result.get(0).groupName());
        assertEquals("<Desconocido>", result.get(1).groupName());
        assertEquals(10L, result.get(0).membersCount());
    }

    @Test
    void getTopGroupsByMembers_shouldThrowNotFound_whenTenantDoesNotExist() {
        String tenantId = "missing";
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> groupStatisticsService.getTopGroupsByMembers(tenantId, 5));
    }

    @Test
    void getTopGroupsByMembers_shouldHandleNullCount_values() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

    List<Object[]> rows = new ArrayList<>();
    rows.add(new Object[]{1L, null});
        Group g1 = new Group();
        g1.setGroupId(1L);
        g1.setName("G1");

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(memberRepository.countMembersByGroupIdByTenant(tenantId)).thenReturn(rows);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(g1));

        List<GroupMembersCountDTO> result = groupStatisticsService.getTopGroupsByMembers(tenantId, 5);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(0L, result.get(0).membersCount());
    }

    @Test
    void getTopGroupsByMembers_shouldRespectLimit_parameter() {
        String tenantId = "tenant-1";
        Tenant tenant = new Tenant();
        tenant.setTenantId(tenantId);

        List<Object[]> rows = List.of(new Object[]{1L, 10L}, new Object[]{2L, 9L}, new Object[]{3L, 8L});

        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(memberRepository.countMembersByGroupIdByTenant(tenantId)).thenReturn(rows);
        when(groupRepository.findById(anyLong())).thenReturn(Optional.empty());

        List<GroupMembersCountDTO> result = groupStatisticsService.getTopGroupsByMembers(tenantId, 2);

        assertNotNull(result);
        assertEquals(2, result.size());
    }
}
