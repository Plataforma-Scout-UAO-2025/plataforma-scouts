package uao.edu.co.scouts_project.guardian.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uao.edu.co.scouts_project.guardian.model.Member;

@Repository
public interface GuardianRepository extends JpaRepository<Member, String> {

    List<Member> findByIsActive(boolean active);
}
