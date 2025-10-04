package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import uao.edu.co.scouts_project.finanzas.fees.model.Concept;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;

public interface IFeePlanRepository extends JpaRepository<FeePlan, Long> {
        boolean existsByConcept(Concept concept);
        List<FeePlan> findByConcept_TenantId(Long tenantId);
        Optional<FeePlan> findByFeePlanIdAndConcept_TenantId(Long feePlanId, Long tenantId);
}
