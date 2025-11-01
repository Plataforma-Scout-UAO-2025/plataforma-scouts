package uao.edu.co.scouts_project.finanzas.fees.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
class FeeServiceImplDeleteFeePlanTest {

  @Mock IConceptRepository conceptRepo;
  @Mock IFeePlanRepository feePlanRepo;
  @Mock IMemberReadRepository memberRepo;
  @Mock IAccountRepository accountRepo;
  @Mock IInstallmentRepository installmentRepo;

  // Spy no requerido aquí; FeeMapper no participa en delete, pero mantenemos la firma coherente
  @Mock FeeMapper mapper;

  @InjectMocks
  private FeeServiceImpl service;

  private static final String TENANT = "org_TENANT";

  private Concept concept;
  private FeePlan feePlan;

  @BeforeEach
  void setUp() {
    concept = new Concept();
    concept.setConceptId(123L);

    feePlan = new FeePlan();
    feePlan.setFeePlanId(77L);
    feePlan.setConcept(concept);
  }

  @Test
  void deleteFeePlan_cuandoHayPagos_lanza409_yNoBorraNada() {
    // Arrange
    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(77L, TENANT))
        .thenReturn(Optional.of(feePlan));
    when(installmentRepo.existsAnyPaymentByConcept(123L))
        .thenReturn(true);

    // Act
    Throwable thrown = catchThrowable(() -> service.deleteFeePlan(77L, TENANT));

    // Assert
    assertThat(thrown).isInstanceOf(ResponseStatusException.class);
    ResponseStatusException rse = (ResponseStatusException) thrown;
    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(rse.getReason()).contains("No se puede eliminar la cuota");

    verify(installmentRepo, never()).deleteAllByConcept(anyLong());
    verify(feePlanRepo, never()).delete(any());
    verify(feePlanRepo, never()).flush();
    verify(conceptRepo, never()).delete(any());
  }

  @Test
  void deleteFeePlan_sinPagos_ySinReferencias_borraInstallments_FeePlan_yConcept_enOrden() {
    // Arrange
    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(77L, TENANT))
        .thenReturn(Optional.of(feePlan));
    when(installmentRepo.existsAnyPaymentByConcept(123L))
        .thenReturn(false);

    // Tras borrar, ya no quedan fee plans ni installments del concepto
    when(feePlanRepo.countByConcept_ConceptId(123L)).thenReturn(0L);
    when(installmentRepo.countAllByConcept(123L)).thenReturn(0L);

    // Act
    service.deleteFeePlan(77L, TENANT);

    // Assert (orden esperado)
    InOrder inOrder = inOrder(installmentRepo, feePlanRepo, conceptRepo);
    inOrder.verify(installmentRepo).deleteAllByConcept(123L);
    inOrder.verify(feePlanRepo).delete(feePlan);
    inOrder.verify(feePlanRepo).flush();
    inOrder.verify(feePlanRepo).countByConcept_ConceptId(123L);
    inOrder.verify(installmentRepo).countAllByConcept(123L);
    inOrder.verify(conceptRepo).delete(concept);

    verifyNoMoreInteractions(installmentRepo, feePlanRepo, conceptRepo);
  }

  @Test
  void deleteFeePlan_sinPagos_peroConReferencias_noBorraConcept() {
    // Arrange
    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(77L, TENANT))
        .thenReturn(Optional.of(feePlan));
    when(installmentRepo.existsAnyPaymentByConcept(123L))
        .thenReturn(false);

    // Aún quedan referencias (p.ej. otro fee plan u otros installments)
    when(feePlanRepo.countByConcept_ConceptId(123L)).thenReturn(1L);
    when(installmentRepo.countAllByConcept(123L)).thenReturn(0L);

    // Act
    service.deleteFeePlan(77L, TENANT);

    // Assert
    verify(installmentRepo).deleteAllByConcept(123L);
    verify(feePlanRepo).delete(feePlan);
    verify(feePlanRepo).flush();
    verify(feePlanRepo).countByConcept_ConceptId(123L);
    verify(installmentRepo).countAllByConcept(123L);
    verify(conceptRepo, never()).delete(any());
  }

  @Test
  void deleteFeePlan_feePlanNoExiste_lanzaNoSuchElementException() {
    // Arrange
    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(999L, TENANT))
        .thenReturn(Optional.empty());

    // Act + Assert
    assertThatThrownBy(() -> service.deleteFeePlan(999L, TENANT))
        .isInstanceOf(NoSuchElementException.class)
        .hasMessageContaining("FeePlan not found for this tenant");

    verifyNoInteractions(installmentRepo, conceptRepo);
  }
}
