package uao.edu.co.scouts_project.guardian.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.guardian.model.AvailableGuardian;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;

@Repository
public interface GuardianRepository extends JpaRepository<Member, Long> {
        
        @Query("SELECT new uao.edu.co.scouts_project.guardian.model.MemberCustom(" +
                        "m.memberId, m.firstName, m.lastName, m.identification, m.documentType, m.age, m.gender, m.phone, m.birthDate, m.address, m.isActive, m.email, m.role, m.relationship) "
                        +
                        "FROM Member m WHERE m.guardianId = :guardianId")
        List<MemberCustom> findMembersInChargeOf(@Param("guardianId") Long guardianId);

        @Query("SELECT new uao.edu.co.scouts_project.guardian.model.AvailableGuardian(" +
                        "m.memberId, m.firstName, m.lastName, m.identification) " +
                        "FROM Member m WHERE m.role = 'ACUDIENTE' AND m.isActive = true")
        List<AvailableGuardian> findAvailableGuardians();

        @Query("SELECT new uao.edu.co.scouts_project.guardian.model.MemberCustom(" +
                "m.memberId, m.firstName, m.lastName, m.identification, m.documentType, " +
                "m.age, m.gender, m.phone, m.birthDate, m.address, m.isActive, m.email, m.role, m.relationship) " +
                "FROM Member m WHERE m.guardianId IS NULL AND m.role = 'SCOUT' AND m.age < 18 AND m.isActive = true")
        List<MemberCustom> findMembersWithoutGuardian();

        @Query("SELECT m FROM Member m WHERE m.memberId = :id AND m.role = 'ACUDIENTE'")
        Optional<Member> findValidGuardianById(@Param("id") Long id);
        
        @Modifying
        @Query("UPDATE Member m SET m.guardianId = NULL WHERE m.guardianId = :guardianId AND m.age >= 18")
        void removeGuardianIdFromMembers(@Param("guardianId") Long guardianId);

        @Modifying
        @Query("DELETE FROM Member m WHERE m.memberId = :guardianId")
        void deleteGuardianById(@Param("guardianId") Long guardianId);

        @Modifying
        @Query("UPDATE Member m SET m.guardianId = :newGuardianId WHERE m.memberId = :memberId AND m.guardianId = :currentGuardianId")
        int reassignMemberGuardian(
            @Param("memberId") Long memberId, 
            @Param("currentGuardianId") Long currentGuardianId, 
            @Param("newGuardianId") Long newGuardianId
        );

        @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Member m WHERE m.identification = :identification AND m.role = 'ACUDIENTE'")
        boolean existsByValidGuardianIdentification(@Param("identification") String identification);

}
