package uao.edu.co.scouts_project.member.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByIdentification(@NotNull String identification);

    List<Member> findByStatus(Status status);

    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.subgroup")
    List<Member> findAllWithSubgroup();

    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.subgroup WHERE m.memberId = :memberId")
    Optional<Member> findByIdWithSubgroup(@Param("memberId") Long memberId);

    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.subgroup WHERE m.status = :status")
    List<Member> findByStatusWithSubgroup(@Param("status") Status status);


}
