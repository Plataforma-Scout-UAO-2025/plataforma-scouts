package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;

public interface IInstallmentRepository extends JpaRepository<Installment, Long> { 
    List<Installment> findByConceptId(Long conceptId);
}
