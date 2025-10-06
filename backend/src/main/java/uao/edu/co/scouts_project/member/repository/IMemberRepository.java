package uao.edu.co.scouts_project.member.repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByIdentification(@NotNull String identification);

    List<Member> findByStatus(Status status);


}
