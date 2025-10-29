package uao.edu.co.scouts_project.finanzas.fees.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.IdNameDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;

import uao.edu.co.scouts_project.finanzas.fees.mapper.FeeMapper;

import uao.edu.co.scouts_project.finanzas.fees.model.Account;
import uao.edu.co.scouts_project.finanzas.fees.model.Concept;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;

import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;

import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;

import uao.edu.co.scouts_project.finanzas.fees.repository.IAccountRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IConceptRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IFeePlanRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IInstallmentRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.IMemberReadRepository;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.IdNameProjection;
import uao.edu.co.scouts_project.finanzas.fees.service.IFeeService;

@Slf4j                                 
@Service
@RequiredArgsConstructor               
@Transactional                         
public class FeeServiceImpl implements IFeeService {

  private final IConceptRepository conceptRepo;
  private final IFeePlanRepository feePlanRepo;
  private final IMemberReadRepository memberRepo;
  private final IAccountRepository accountRepo;
  private final IInstallmentRepository installmentRepo;
  private final FeeMapper mapper;

  // ---------------------------------------------------------------------
  // CREATE (con generación de installments) - usando associated_to
  // ---------------------------------------------------------------------

  /**
   * Crea una nueva cuota (FeePlan) y genera los Installments según el scope definido.
   * - Valida fechas y tipo de alcance (scope).
   * - Realiza un upsert del Concepto según su nombre y tenant.
   * - Normaliza el campo JSON `associated_to` para cumplir las restricciones de la base de datos.
   * - Construye el calendario de pagos según la periodicidad indicada.
   * - Crea las cuentas necesarias y los installments correspondientes.
   * - Devuelve un CuotaDto; si el scope es SCOUT, incluye información del miembro asociado.
   */

  @Override
  public CuotaDto create(@NonNull CreateCuotaDto dto) {
    final String tenantId = dto.tenant_id();

    // Validacion de consistencia temporal.
    if (dto.end_date().isBefore(dto.start_date())) {
      throw new IllegalArgumentException("end_date must be >= start_date");
    }
    if (dto.periodicity() == Periodicity.SINGLE &&
        !dto.end_date().equals(dto.start_date())) {
      throw new IllegalArgumentException("For SINGLE periodicity, end_date must equal start_date");
    }
    if (dto.amount() == null || dto.amount().compareTo(BigDecimal.ZERO) <= 0) {
    throw new IllegalArgumentException("amount must be greater than zero");
    }
    

    // Validacion del 'associated_to' según el scope.
    validateAssociatedTo(dto);

    // Upsert de Concept por nombre (scope por tenant).
    Concept concept = conceptRepo.findByNameIgnoreCase(dto.name())
        .orElseGet(() -> {
          var c = Concept.builder()
              .name(dto.name())
              .description(dto.description())
              .tenantId(tenantId)
              .build();
          return conceptRepo.save(c);
        });
    if (concept.getTenantId() == null) {
      concept.setTenantId(tenantId);
      concept = conceptRepo.save(concept);
    }

    //FeePlan con builder.
    FeePlan fp = FeePlan.builder()
        .concept(concept)
        .amount(dto.amount())
        .periodicity(dto.periodicity() != null ? dto.periodicity().name() : null)
        .scope(dto.scope() != null ? dto.scope().name() : null)
        .startDate(dto.start_date())
        .endDate(dto.end_date())
        .tenantId(tenantId)
        .build();

    final JsonNode associatedTo = dto.associated_to(); // puede ser null en scope=ALL

    // Extraer assocId si viene (para buscar targets).
    final String assocId = (associatedTo != null && !associatedTo.isNull() && associatedTo.hasNonNull("id"))
        ? associatedTo.get("id").asText()
        : null;

    List<MemberView> targets = switch (dto.scope()) {
      case ALL      -> memberRepo.findScoutsByTenant(tenantId);
      case SCOUT    -> memberRepo.findScoutById(tenantId, parseAssocId(assocId, "SCOUT"));
      case SECTION  -> memberRepo.findScoutsBySection(tenantId, parseAssocId(assocId, "SECTION"));
      case SUBGROUP -> memberRepo.findScoutsBySubgroup(tenantId, parseAssocId(assocId, "SUBGROUP"));
    };

    if (dto.scope() != FeeScope.ALL && (targets == null || targets.isEmpty())) {
      throw new IllegalArgumentException("No targets found for the provided associated_to.id / scope.");
    }

    //normalizacion de associated_to cumpliendo el CHECK (null o json object con id/name).
    normalizeAssociatedTo(dto, fp, associatedTo, targets);

    feePlanRepo.save(fp);
    log.info("Created FeePlan id={} tenant={} scope={} targets={}",
        fp.getFeePlanId(), tenantId, dto.scope(), dto.scope() == FeeScope.ALL ? "ALL" : targets.size());

    //Calendario por periodicidad.
    List<LocalDate> schedule = buildSchedule(dto.periodicity(), dto.start_date(), dto.end_date());

    // Creacion de installments para cada target y cada fecha del calendario.
    for (MemberView m : targets) {
      Account acc = accountRepo.findByMemberIdAndActiveTrue(m.getMemberId())
          .orElseGet(() -> accountRepo.save(
              Account.builder()
                  .memberId(m.getMemberId())
                  .tenantId(tenantId)
                  .active(true)
                  .build()
          ));

      List<Installment> toCreate = new ArrayList<>();
      for (LocalDate due : schedule) {
        Installment inst = Installment.builder()
            .accountId(acc.getAccountId())
            .conceptId(concept.getConceptId())
            .dueDate(due)
            .amount(dto.amount())
            .tenantId(tenantId)
            .balance(dto.amount())
            .status("PENDING")
            .payments(JsonNodeFactory.instance.arrayNode()) // nunca null
            .build();

        toCreate.add(inst);
      }
      installmentRepo.saveAll(toCreate);
    }

    //DTO de salida. Si el scope es SCOUT, incluyo el primer miembro target.
    MemberPaymentDto member = (dto.scope() == FeeScope.SCOUT && !targets.isEmpty())
        ? mapper.toMemberDto(targets.get(0))
        : null;

    return mapper.toCuotaDto(fp, member);
  }

  // ---------------------------------------------------------------------
  // GET Listados de Cuotas y miembros separados.
  // ---------------------------------------------------------------------

  /**
   * Devuelve todos los FeePlans cuyo Concept pertenece al tenant indicado.
   */
  @Override
  @Transactional(readOnly = true)
  public List<CuotaDto> listFeesByTenant(@NonNull String tenantId) {
    return feePlanRepo.findByConcept_TenantId(tenantId).stream()
        .map(mapper::toCuotaDto)
        .toList();
  }

  /**
   * Miembros con jerarquía (subgrupo/sección) del tenant.
   */
  @Override
  @Transactional(readOnly = true)
  public List<MemberPaymentDto> listMembersByTenant(@NonNull String tenantId) {
    return memberRepo.findHierarchyByTenant(tenantId).stream()
        .map(mapper::toMemberDto)
        .toList();
  }

  // ---------------------------------------------------------------------
  // GET Listados de Subgrupos y Ramas por tenant.
  // ---------------------------------------------------------------------

  /**
   * Obtiene la lista de subgrupos (id, name) distintos registrados para un tenant.
   */
  @Override
  @Transactional(readOnly = true)
  public List<IdNameDto> listSubgroupsByTenant(@NonNull String tenantId) {
    List<IdNameProjection> rows = memberRepo.findDistinctSubgroupsByTenant(tenantId);
    return rows.stream()
        .map(r -> new IdNameDto(r.getId(), r.getName()))
        .toList();
  }

  /**
   * Obtiene la lista de ramas (id, name) distintas registradas para un tenant.
   */
  @Override
  @Transactional(readOnly = true)
  public List<IdNameDto> listSectionsByTenant(@NonNull String tenantId) {
    List<IdNameProjection> rows = memberRepo.findDistinctSectionsByTenant(tenantId);
    return rows.stream()
        .map(r -> new IdNameDto(r.getId(), r.getName()))
        .toList();
  }

  // ---------------------------------------------------------------------
  // PATCH (actualizo monto y propago a installments)
  // ---------------------------------------------------------------------

  /**
   * Actualiza parcialmente un FeePlan:
   * - Modifica el nombre y la descripción del Concept si se envían nuevos valores.
   * - Si cambia el monto, lo actualiza y propaga el nuevo valor a todos los Installments asociados.
   * - No modifica el scope, la periodicidad ni las fechas.
   */
  @Override
  public CuotaDto patch(@NonNull Long feePlanId, @NonNull CuotaDto patch, @NonNull String tenantId) {
    FeePlan fp = feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenantId)
        .orElseThrow(() -> new NoSuchElementException("FeePlan not found for tenant " + tenantId));

    Concept c = fp.getConcept();

    // Concepto: nombre y descripción
    if (patch.name() != null && !patch.name().isBlank()) {
      c.setName(patch.name());
    }
    if (patch.description() != null && !patch.description().isBlank()) {
      c.setDescription(patch.description());
    }
    conceptRepo.save(c);

    // Monto
    if (patch.amount() != null) {
      fp.setAmount(patch.amount());
      feePlanRepo.save(fp);

      // Actualizo TODOS los installments vinculados a este concepto
      List<Installment> installments = installmentRepo.findByConceptId(c.getConceptId());
      for (Installment inst : installments) {
        inst.setAmount(patch.amount());
      }
      installmentRepo.saveAll(installments);
      log.info("Patched FeePlan id={} amount={}, updated {} installments", fp.getFeePlanId(), patch.amount(), installments.size());
    }

    return mapper.toCuotaDto(fp, (MemberPaymentDto) null);
  }

  // ---------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------

  @Transactional
  public void deleteFeePlan(@NonNull Long feePlanId, @NonNull String tenantId) {
    FeePlan fp = feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenantId)
        .orElseThrow(() -> new NoSuchElementException("FeePlan not found for this tenant"));

    Concept concept = fp.getConcept();

    // 1) Verifica si existe AL MENOS un installment con pagos
    boolean hasAnyPayment = installmentRepo.existsAnyPaymentByConcept(concept.getConceptId());
    if (hasAnyPayment) {
      // 409 Conflict: estado actual del recurso impide la operación
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "No se puede eliminar la cuota (FeePlan) porque existen pagos asociados en sus cuotas (installments)."
      );
    }

    // 2) Si no hay pagos, puedes borrar TODOS los installments del concepto y luego el fee plan
    installmentRepo.deleteAllByConcept(concept.getConceptId());

    // Elimina el fee plan y fuerza el flush para respetar el orden (evita violar la FK)
    feePlanRepo.delete(fp);
    feePlanRepo.flush();

    // 3) Limpieza del Concept si ya no está referenciado
    long feePlansLeft = feePlanRepo.countByConcept_ConceptId(concept.getConceptId());
    long installmentsLeft = installmentRepo.countAllByConcept(concept.getConceptId());

    if (feePlansLeft == 0 && installmentsLeft == 0) {
      conceptRepo.delete(concept);
      log.info("Deleted Concept id={} (no fee plans or installments remain)", concept.getConceptId());
    } else {
      log.info("Kept Concept id={} (feePlansLeft={}, installmentsLeft={})",
          concept.getConceptId(), feePlansLeft, installmentsLeft);
    }
  }


  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  /**
   * Genera una lista de fechas de vencimiento según la periodicidad indicada.
   * Incluye la fecha inicial y continúa agregando intervalos hasta la fecha final.
   */
  private List<LocalDate> buildSchedule(Periodicity per, LocalDate start, LocalDate end) {
    List<LocalDate> dates = new ArrayList<>();
    switch (per) {
      case SINGLE -> dates.add(start);
      case MONTH  -> {
        LocalDate d = start;
        while (!d.isAfter(end)) { dates.add(d); d = d.plusMonths(1); }
      }
      case QUARTER -> {
        LocalDate d = start;
        while (!d.isAfter(end)) { dates.add(d); d = d.plusMonths(3); }
      }
      case YEAR -> {
        LocalDate d = start;
        while (!d.isAfter(end)) { dates.add(d); d = d.plusYears(1); }
      }
    }
    return dates;
  }

  /**
   * Valida el campo `associated_to` según el alcance (scope) del FeePlan.
   * - Si el scope es ALL, el valor debe ser null.
   * - En otros casos, debe contener un objeto JSON con la propiedad `id` válida.
   */
  private void validateAssociatedTo(CreateCuotaDto dto) {
    if (dto.scope() == FeeScope.ALL) {
      if (dto.associated_to() != null && !dto.associated_to().isNull()) {
        throw new IllegalArgumentException("associated_to must be null when scope=ALL");
      }
    } else {
      JsonNode at = dto.associated_to();
      if (at == null || at.isNull() || !at.hasNonNull("id")) {
        throw new IllegalArgumentException("associated_to.id is required for scope=" + dto.scope());
      }
    }
  }

  /**
   * Convierte el identificador `associated_to.id` a tipo Long.
   * Lanza una excepción si el valor no es numérico o no es válido.
   */
  private Long parseAssocId(String assocId, String scopeName) {
    try {
      return Long.valueOf(assocId);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("associated_to.id must be a valid Long for scope=" + scopeName);
    }
  }

  /**
   * Normaliza el campo JSON `associated_to` antes de guardar el FeePlan:
   * - Para scope=ALL, lo deja en null (valor SQL).
   * - Para otros scopes, se asegura de que contenga un objeto con `id` y `name`.
   *   Si `name` está vacío, intenta resolverlo a partir de los miembros objetivo.
   */
  private void normalizeAssociatedTo(CreateCuotaDto dto, FeePlan fp, JsonNode associatedTo, List<MemberView> targets) {
    if (dto.scope() == FeeScope.ALL) {
      fp.setAssociatedTo(null);
      return;
    }
    if (associatedTo == null || associatedTo.isNull() || !associatedTo.isObject()) {
      throw new IllegalArgumentException("associated_to must be a JSON object when scope=" + dto.scope());
    }
    var obj = (ObjectNode) associatedTo;
    String idVal = obj.hasNonNull("id") ? obj.get("id").asText() : null;
    String nameVal = obj.hasNonNull("name") ? obj.get("name").asText() : null;

    if (idVal == null || idVal.isBlank()) {
      throw new IllegalArgumentException("associated_to.id is required and non-empty");
    }
    if (nameVal == null || nameVal.isBlank()) {
      String resolved = resolveAssociatedName(dto.scope(), targets);
      if (resolved == null || resolved.isBlank()) {
        throw new IllegalArgumentException("associated_to.name is required and non-empty for scope=" + dto.scope());
      }
      obj.put("name", resolved);
    }
    fp.setAssociatedTo(obj);
  }

  /**
   * Obtiene el nombre asociado según el scope (SCOUT, SECTION o SUBGROUP),
   * tomando como referencia el primer miembro objetivo.
   * En caso de no tener el valor directamente, intenta obtenerlo por reflexión.
   */
  private String resolveAssociatedName(FeeScope scope, List<MemberView> targets) {
    if (targets == null || targets.isEmpty()) return null;
    MemberView t = targets.get(0);
    return switch (scope) {
      case SCOUT -> ((t.getFirstName() == null ? "" : t.getFirstName())
                   + " "
                   + (t.getLastName() == null ? "" : t.getLastName())).trim();
      case SECTION -> tryReadName(t, "getSectionName");
      case SUBGROUP -> tryReadName(t, "getSubgroupName");
      case ALL -> null;
    };
  }

  /**
   * Método auxiliar temporal que usa reflexión para obtener nombres
   * de sección o subgrupo cuando la proyección no los incluye directamente.
   */
  private String tryReadName(Object obj, String method) {
    try {
      var m = obj.getClass().getMethod(method);
      Object val = m.invoke(obj);
      return val != null ? String.valueOf(val) : null;
    } catch (Exception e) {
      log.debug("Could not read {} via reflection: {}", method, e.getMessage());
      return null;
    }
  }
}
