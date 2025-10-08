package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.finanzas.fees.model.Account;

public interface IAccountRepository extends JpaRepository<Account, Long> {
  Optional<Account> findByMemberIdAndActiveTrue(Long memberId);
}
