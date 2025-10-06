package uao.edu.co.scouts_project.member.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.member.model.Member;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByIdentification(@NotNull String identification);

    @Query(value = "SELECT * FROM member WHERE status = :status", nativeQuery = true)
    List<Member> findByStatus(@Param("status") String status);


}
