package uao.edu.co.scouts_project.guardian.service;

import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;

public interface GuardianService {
    
    List<GuardianCreateDTO> findAllGuardians();
    GuardianCreateDTO findGuardianById(String id);
    List<GuardianCreateDTO> findGuardiansByStatus(boolean active);
    GuardianCreateDTO saveGuardian(GuardianCreateDTO guardianCreateDTO);
    GuardianCreateDTO updateGuardianById(String guardianId, GuardianCreateDTO guardianCreateDTO);
    GuardianCreateDTO addMemberToGuardian(String guardianId, String memberId);
    GuardianCreateDTO removeMemberFromGuardian(String guardianId, String memberId);
    boolean deleteGuardianById(String guardianId);
    List<MemberDTO> findAvailableMembers();
}