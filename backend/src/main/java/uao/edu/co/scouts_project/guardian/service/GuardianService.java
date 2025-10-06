package uao.edu.co.scouts_project.guardian.service;

import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.GuardianDTO;
import uao.edu.co.scouts_project.guardian.dto.MemberSummaryDTO;

public interface GuardianService {
    
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