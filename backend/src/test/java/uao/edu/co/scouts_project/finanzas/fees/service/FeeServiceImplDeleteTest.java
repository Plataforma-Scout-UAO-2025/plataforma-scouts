package uao.edu.co.scouts_project.finanzas.fees.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    // Stub: retorna cantidad de filas “vacías” eliminadas (cualquier número > 0 está bien)
    when(installmentRepo.deleteEmptyPaymentsByConcept(conceptId)).thenReturn(2);
    // Luego de eliminar vacíos, ya no quedan installments del concepto
    when(installmentRepo.countAllByConcept(conceptId)).thenReturn(0L);

    service.deleteFeePlan(feePlanId, tenant);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).deleteEmptyPaymentsByConcept(conceptId);
    verify(installmentRepo).countAllByConcept(conceptId);

    // FeePlan SIEMPRE se borra
    verify(feePlanRepo).delete(fp);
    // Como no quedan installments ⇒ borrar Concept
    verify(conceptRepo).delete(concept);

    verify(feePlanRepo, never()).existsByConcept(any());
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

    // Stub: elimina algunos vacíos
    when(installmentRepo.deleteEmptyPaymentsByConcept(conceptId)).thenReturn(1);
    // Quedan installments con pagos
    when(installmentRepo.countAllByConcept(conceptId)).thenReturn(2L);

    service.deleteFeePlan(feePlanId, tenant);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).deleteEmptyPaymentsByConcept(conceptId);
    verify(installmentRepo).countAllByConcept(conceptId);

    // FeePlan SIEMPRE se borra
    verify(feePlanRepo).delete(fp);
    // Como aún quedan installments ⇒ NO borrar Concept
    verify(conceptRepo, never()).delete(any());

    verify(feePlanRepo, never()).existsByConcept(any());
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
