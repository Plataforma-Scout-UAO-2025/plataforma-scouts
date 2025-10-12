package uao.edu.co.scouts_project.guardian.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;

@Repository
public interface GuardianRepository extends JpaRepository<Member, Long> {

    List<Member> findByIsActive(boolean active);

    @Query("SELECT new uao.edu.co.scouts_project.guardian.model.MemberCustom(" +
            "m.firstName, m.lastName, m.identification, m.documentType, m.age, m.gender, m.phone, m.birthDate) " +
            "FROM Member m WHERE m.guardianId = :guardianId")
    List<MemberCustom> findMembersInChargeOf(@Param("guardianId") Long guardianId);

    @Query("SELECT m FROM Member m WHERE m.memberId = :id AND m.role = 'ACUDIENTE' AND m.status = 'APPROVED' AND m.isActive = true")
    Optional<Member> findValidGuardianById(@Param("id") Long id);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Member m WHERE m.memberId = :id AND m.role = 'ACUDIENTE'")
    boolean existsByIdAndHasRoleAcudiente(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Member m SET m.guardianId = NULL WHERE m.guardianId = :guardianId")
    void deleteGuardianIdFromMember(@Param("guardianId") Long guardianId);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Member m WHERE m.identification = :identification AND m.role = 'ACUDIENTE' AND m.status = 'APPROVED' AND m.isActive = true")
    boolean existsByValidGuardianIdentification(@Param("identification") String identification);

}
