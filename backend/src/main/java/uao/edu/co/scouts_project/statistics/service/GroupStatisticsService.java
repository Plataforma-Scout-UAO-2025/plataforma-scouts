package uao.edu.co.scouts_project.statistics.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersCountDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupStatisticsDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;
import uao.edu.co.scouts_project.statistics.dto.InactiveGroupStatisticsDTO;
import java.util.List;
import java.util.ArrayList;

@Service
public class GroupStatisticsService {
    
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final IMemberRepository memberRepository;

    public GroupStatisticsService(GroupRepository groupRepository, TenantRepository tenantRepository, IMemberRepository memberRepository) {
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.memberRepository = memberRepository;
    }
    
    @Transactional(readOnly = true)
    public GroupStatisticsDTO getGroupStatistics(String tenantId) {
        // Validar que el tenant existe: lanzar 404 si no existe
        tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        // Contar grupos activos del tenant (null-safe)
        Long activeGroupsLong = groupRepository.countByTenantIdAndIsActiveTrue(tenantId);
        long activeGroups = (activeGroupsLong == null) ? 0L : activeGroupsLong;
        return new GroupStatisticsDTO(activeGroups);
    }

    /**
     * Versión global: obtiene estadísticas de grupos sin filtrar por tenant.
     */
    @Transactional(readOnly = true)
    public GroupStatisticsDTO getGroupStatistics() {
        Long activeGroupsLong = groupRepository.countByIsActiveTrue();
        long activeGroups = (activeGroupsLong == null) ? 0L : activeGroupsLong;
        return new GroupStatisticsDTO(activeGroups);
    }

    @Transactional(readOnly = true)
    public InactiveGroupStatisticsDTO getInactiveGroupStatistics(String tenantId) {
        // Validar que el tenant existe: lanzar 404 si no existe
        tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        // Contar grupos inactivos del tenant (null-safe)
        Long inactiveGroupsLong = groupRepository.countByTenantIdAndIsActiveFalse(tenantId);
        long inactiveGroups = (inactiveGroupsLong == null) ? 0L : inactiveGroupsLong;
        return new uao.edu.co.scouts_project.statistics.dto.InactiveGroupStatisticsDTO(inactiveGroups);
    }

    /**
     * Versión global: obtiene el número total de grupos inactivos en la plataforma.
     */
    @Transactional(readOnly = true)
    public InactiveGroupStatisticsDTO getInactiveGroupStatistics() {
        Long inactiveGroupsLong = groupRepository.countByIsActiveFalse();
        long inactiveGroups = (inactiveGroupsLong == null) ? 0L : inactiveGroupsLong;
        return new InactiveGroupStatisticsDTO(inactiveGroups);
    }

    @Transactional(readOnly = true)
    public List<GroupMembersDTO> getMembersByGroup(String tenantId) {
        // Validar que el tenant existe: lanzar 404 si no existe
        tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        // Obtener el conteo de miembros por grupo
        return memberRepository.countMembersByGroup(tenantId);
    }

    /**
     * Versión global: cantidad de miembros por grupo sin filtrar por tenant.
     */
    @Transactional(readOnly = true)
    public List<GroupMembersDTO> getMembersByGroup() {
        return memberRepository.countMembersByGroupAll();
    }

    @Transactional(readOnly = true)
    public List<GroupMembersCountDTO> getTopGroupsByMembers(String tenantId, int limit) {
        // Validar tenant
        tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant no encontrado"));

        // Obtener conteo de miembros por groupId (descendente)
        List<Object[]> rows = memberRepository.countMembersByGroupIdByTenant(tenantId);
        List<GroupMembersCountDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            if (result.size() >= limit) break;
            Long groupId = (Long) row[0];
            Long count = (Long) row[1];
            // Buscar nombre del grupo (si existe)
            var groupOpt = groupRepository.findById(groupId);
            String groupName = groupOpt.map(g -> g.getName()).orElse("<Desconocido>");
            String status = groupOpt.map(g -> g.getStatus()).orElse("<Desconocido>");
            result.add(new GroupMembersCountDTO(groupId, groupName, status, count == null ? 0L : count));
        }

        return result;
    }

    /**
     * Versión global: top N grupos con más miembros en toda la plataforma.
     */
    @Transactional(readOnly = true)
    public List<GroupMembersCountDTO> getTopGroupsByMembers(int limit) {
        List<Object[]> rows = memberRepository.countMembersByGroupIdAll();
        List<GroupMembersCountDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            if (result.size() >= limit) break;
            Long groupId = (Long) row[0];
            Long count = (Long) row[1];
            var groupOpt = groupRepository.findById(groupId);
            String groupName = groupOpt.map(g -> g.getName()).orElse("<Desconocido>");
            String status = groupOpt.map(g -> g.getStatus()).orElse("<Desconocido>");
            result.add(new GroupMembersCountDTO(groupId, groupName, status, count == null ? 0L : count));
        }

        return result;
    }
}