package uao.edu.co.scouts_project.guardian.service;

import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.GuardianDTO;
import uao.edu.co.scouts_project.guardian.dto.MemberCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.MemberResponseDTO;
import uao.edu.co.scouts_project.guardian.dto.MemberSummaryDTO;

public interface GuardianService {
    // Métodos generales para Member
    List<MemberResponseDTO> findAll();
    MemberResponseDTO findMemberById(String id);
    List<MemberResponseDTO> findMemberByStatus(boolean active);
    MemberResponseDTO saveMember(MemberCreateDTO memberCreateDTO);
    MemberResponseDTO updateMemberById(String memberId, MemberCreateDTO memberCreateDTO);
    MemberResponseDTO updateMemberRole(String memberId, String newRole);
    MemberResponseDTO updateMemberStatus(String memberId, boolean isActive);
    boolean deleteMemberById(String memberId);

    // Métodos específicos para Guardian (mismo servicio)
    List<GuardianDTO> findAllGuardians();
    GuardianDTO findGuardianById(String id);
    List<GuardianDTO> findGuardiansByStatus(boolean active);
    GuardianDTO saveGuardian(GuardianCreateDTO guardianCreateDTO);
    GuardianDTO updateGuardianById(String guardianId, GuardianCreateDTO guardianCreateDTO);
    GuardianDTO addMemberToGuardian(String guardianId, String memberId);
    GuardianDTO removeMemberFromGuardian(String guardianId, String memberId);
    boolean deleteGuardianById(String guardianId);
    List<MemberSummaryDTO> findAvailableMembers();
}