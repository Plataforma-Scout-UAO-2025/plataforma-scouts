package uao.edu.co.scouts_project.guardian.service;

import java.util.List;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.AvailableGuardianDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianCreateResponse;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;

public interface GuardianService {
    
    // Reads
    GuardianCreateDTO findGuardianById(Long id);
    GuardianWithMembersDTO findGuardianWithMembers(Long guardianId);
    List<MemberDTO> findMembersInChargeOf(Long guardianId);
    List<MemberDTO> findMembersWithoutGuardian();
    List<AvailableGuardianDTO> findAvailableGuardians();

    // Writes
    GuardianCreateResponse saveGuardian(GuardianCreateDTO guardianCreateDTO);
    void updateGuardianById(Long guardianId, GuardianCreateDTO guardianCreateDTO);
    void deleteGuardianById(Long guardianId);
    void addMemberToGuardian(Long guardianId, Long memberId);
    void removeGuardianIdFromMember(Long guardianId, Long memberId);
    boolean reassignMemberGuardian(Long memberId, Long currentGuardianId, Long newGuardianId);
    
}