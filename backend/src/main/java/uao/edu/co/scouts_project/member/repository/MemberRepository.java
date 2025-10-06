package uao.edu.co.scouts_project.member.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.member.model.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    List<Member> findByIsActive(boolean active);
}
