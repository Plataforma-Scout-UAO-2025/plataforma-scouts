package uao.edu.co.scouts_project.member.Repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.member.Model.MemberModel;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<MemberModel, Integer> {

    Optional<MemberModel> findByIdentification(@NotNull Integer identification);

    @Query(value = "SELECT * FROM member WHERE status = :status", nativeQuery = true)
    List<MemberModel> findByStatus(@Param("status") String status);


}
