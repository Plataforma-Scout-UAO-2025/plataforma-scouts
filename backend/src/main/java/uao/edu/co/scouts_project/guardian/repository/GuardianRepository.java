package uao.edu.co.scouts_project.guardian.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;

@Repository
public interface GuardianRepository extends JpaRepository<Member, String> {

    List<Member> findByIsActive(boolean active);
    //TODO: create a method that follows this structure
    @Query("SELECT new uao.edu.co.scouts_project.guardian.model.MemberCustom(m.memberId, m.firstName, m.lastName, m.gender, m.phone, m.birthDate) " +
            "FROM Member m WHERE m.guardianId = :guardianId")
    List<MemberCustom> findMembersImInChargeOf(@Param("guardianId") Integer guardianId); //in the service we apply the mapping
    //logic create in the model package a new model that captures this custom query value
}
