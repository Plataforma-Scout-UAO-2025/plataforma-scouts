package uao.edu.co.scouts_project.finanzas.fees.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.List;
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
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;
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
  void deleteFeePlan_hardDelete_deletesInstallmentsFeePlanAndConcept_whenConceptUnused() {
    // Arrange
    final String tenant = "org_ABC";
    final long feePlanId = 10L;
    final long conceptId = 3L;

    Concept concept = TestData.concept(conceptId, tenant, "Inscripción", "Matrícula");
    FeePlan  fp      = TestData.feePlan(feePlanId, tenant, concept);

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.of(fp));

    List<Installment> insts = List.of(
        TestData.installment(101L, tenant, 1001L, conceptId),
        TestData.installment(102L, tenant, 1002L, conceptId)
    );
    when(installmentRepo.findByConceptId(conceptId)).thenReturn(insts);

    // concept ya no se usa por otros fee_plans
    when(feePlanRepo.existsByConcept(concept)).thenReturn(false);

    // Act
    service.deleteFeePlan(feePlanId, tenant);

    // Assert
    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).findByConceptId(conceptId);
    verify(installmentRepo).deleteAll(insts);
    verify(feePlanRepo).delete(fp);
    verify(feePlanRepo).existsByConcept(concept);
    verify(conceptRepo).delete(concept);
    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }

  @Test
  void deleteFeePlan_hardDelete_keepsConcept_whenConceptStillUsed() {
    // Arrange
    final String tenant = "org_ABC";
    final long feePlanId = 11L;
    final long conceptId = 5L;

    Concept concept = TestData.concept(conceptId, tenant, "Mensualidad", "Cuota");
    FeePlan  fp      = TestData.feePlan(feePlanId, tenant, concept);

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.of(fp));

    List<Installment> insts = List.of(
        TestData.installment(201L, tenant, 2001L, conceptId)
    );
    when(installmentRepo.findByConceptId(conceptId)).thenReturn(insts);

    // concept sigue en uso
    when(feePlanRepo.existsByConcept(concept)).thenReturn(true);

    // Act
    service.deleteFeePlan(feePlanId, tenant);

    // Assert
    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verify(installmentRepo).findByConceptId(conceptId);
    verify(installmentRepo).deleteAll(insts);
    verify(feePlanRepo).delete(fp);
    verify(feePlanRepo).existsByConcept(concept);
    verify(conceptRepo, never()).delete(any());
    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }

  @Test
  void deleteFeePlan_notFound_throwsNoSuchElement() {
    // Arrange
    final String tenant = "org_ABC";
    final long feePlanId = 999L;

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenant))
        .thenReturn(Optional.empty());

    // Act + Assert
    assertThatThrownBy(() -> service.deleteFeePlan(feePlanId, tenant))
        .isInstanceOf(NoSuchElementException.class);

    verify(feePlanRepo).findByFeePlanIdAndConcept_TenantId(feePlanId, tenant);
    verifyNoMoreInteractions(feePlanRepo, installmentRepo, conceptRepo);
  }
}
