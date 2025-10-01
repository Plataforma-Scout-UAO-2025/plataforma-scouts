package uao.edu.co.scouts_project.Member.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.Member.Model.SchoolModel;

import java.util.List;

public interface ISchoolRepository extends JpaRepository<SchoolModel, Integer> {

    @Query("SELECT s FROM SchoolModel s WHERE s.member.member_id = :memberId")
    List<SchoolModel> findByMemberId(@Param("memberId") Integer memberId);

}
