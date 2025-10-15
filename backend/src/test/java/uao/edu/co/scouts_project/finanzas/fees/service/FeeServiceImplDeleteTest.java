package uao.edu.co.scouts_project.finanzas.fees.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uao.edu.co.scouts_project.finanzas.fees.data.TestData;
import uao.edu.co.scouts_project.finanzas.fees.mapper.FeeMapper;
import uao.edu.co.scouts_project.finanzas.fees.model.Concept;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;
import uao.edu.co.scouts_project.finanzas.fees.repository.IAccountRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IConceptRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IFeePlanRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IInstallmentRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IMemberReadRepository;
import uao.edu.co.scouts_project.finanzas.fees.service.impl.FeeServiceImpl;

@ExtendWith(MockitoExtension.class)
class FeeServiceImplDeleteTest {

  @Mock private IConceptRepository conceptRepo;
  @Mock private IFeePlanRepository feePlanRepo;
  @Mock private IMemberReadRepository memberRepo;
  @Mock private IAccountRepository accountRepo;
  @Mock private IInstallmentRepository installmentRepo;
  @Mock private FeeMapper mapper;

  @InjectMocks
  private FeeServiceImpl service;

  @Test
  void deleteFeePlan_sqlNative_allEmpties_then_deleteConcept() {
    final String tenant = "org_ABC";
    final long feePlanId = 10L;
    final long conceptId = 3L;

    Concept concept = TestData.concept(conceptId, tenant, "Inscripción", "Matrícula");
    FeePlan  fp      = TestData.feePlan(feePlanId, tenant, concept);

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.of(fp));

    when(installmentRepo.deleteEmptyPaymentsByConcept(conceptId)).thenReturn(2);
    when(installmentRepo.countAllByConcept(conceptId)).thenReturn(0L);

    // nuevo: el servicio pregunta si quedan fee plans del mismo concepto
    when(feePlanRepo.countByConcept_ConceptId(conceptId)).thenReturn(0L);

    service.deleteFeePlan(feePlanId, tenant);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).deleteEmptyPaymentsByConcept(conceptId);

    verify(feePlanRepo).delete(fp);
    // nuevo: se fuerza orden de borrado
    verify(feePlanRepo).flush();

    verify(feePlanRepo).countByConcept_ConceptId(conceptId);
    verify(installmentRepo).countAllByConcept(conceptId);

    // como no quedan fee plans ni installments → borra el concepto
    verify(conceptRepo).delete(concept);

    // quitar esta verificación (ya no usamos existsByConcept)
    // verify(feePlanRepo, never()).existsByConcept(any());

    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }


  @Test
  void deleteFeePlan_sqlNative_mixed_keepConcept() {
    final String tenant = "org_ABC";
    final long feePlanId = 11L;
    final long conceptId = 5L;

    Concept concept = TestData.concept(conceptId, tenant, "Mensualidad", "Cuota");
    FeePlan  fp      = TestData.feePlan(feePlanId, tenant, concept);

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.of(fp));

    when(installmentRepo.deleteEmptyPaymentsByConcept(conceptId)).thenReturn(1);
    when(installmentRepo.countAllByConcept(conceptId)).thenReturn(2L);

    // nuevo: aún quedan fee plans de ese concepto (o al menos 1)
    when(feePlanRepo.countByConcept_ConceptId(conceptId)).thenReturn(1L);

    service.deleteFeePlan(feePlanId, tenant);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).deleteEmptyPaymentsByConcept(conceptId);

    verify(feePlanRepo).delete(fp);
    verify(feePlanRepo).flush();

    verify(feePlanRepo).countByConcept_ConceptId(conceptId);
    verify(installmentRepo).countAllByConcept(conceptId);

    verify(conceptRepo, never()).delete(any());

    // quitar existsByConcept
    // verify(feePlanRepo, never()).existsByConcept(any());

    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }


  @Test
  void deleteFeePlan_notFound_throwsNoSuchElement() {
    final String tenant = "org_ABC";
    final long feePlanId = 999L;

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.deleteFeePlan(feePlanId, tenant))
        .isInstanceOf(NoSuchElementException.class);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }
}
