package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;

public interface IInstallmentRepository extends JpaRepository<Installment, Long> {

    List<Installment> findByConceptId(Long conceptId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        value = """
            DELETE FROM installment
            WHERE concept_id = :conceptId
              AND (payments IS NULL OR payments = '[]'::jsonb)
            """,
        nativeQuery = true
    )
    int deleteEmptyPaymentsByConcept(@org.springframework.data.repository.query.Param("conceptId") Long conceptId);

    @org.springframework.data.jpa.repository.Query(
        value = """
            SELECT COUNT(*) 
            FROM installment 
            WHERE concept_id = :conceptId
            """,
        nativeQuery = true
    )
    long countAllByConcept(@org.springframework.data.repository.query.Param("conceptId") Long conceptId);
}
