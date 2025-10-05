package uao.edu.co.scouts_project.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.member.model.SchoolData;

import java.util.List;

public interface ISchoolRepository extends JpaRepository<SchoolData, Long> {

    @Query("SELECT s FROM SchoolData s WHERE s.member.member_id = :memberId")
    List<SchoolData> findByMemberId(@Param("memberId") Integer memberId);

}
