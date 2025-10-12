package uao.edu.co.scouts_project.guardian.service;

import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;

public interface GuardianService {
    
    // Reads
    GuardianCreateDTO findGuardianById(Long id);
    GuardianWithMembersDTO findGuardianWithMembers(Long guardianId);
    List<MemberDTO> findMembersInChargeOf(Long guardianId);

    // Writes
    void saveGuardian(GuardianCreateDTO guardianCreateDTO);
    void updateGuardianById(Long guardianId, GuardianCreateDTO guardianCreateDTO);
    void deleteGuardianById(Long guardianId);
    void addMemberToGuardian(Long guardianId, Long memberId);
    void removeGuardianIdFromMember(Long guardianId, Long memberId);
}