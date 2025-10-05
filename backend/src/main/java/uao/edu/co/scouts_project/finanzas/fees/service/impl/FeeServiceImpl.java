package uao.edu.co.scouts_project.finanzas.fees.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.databind.JsonNode;

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
  @Override
  public CuotaDto create(CreateCuotaDto dto) {
    final String tenantId = dto.tenant_id();

    // -------- Validaciones básicas --------
    if (dto.end_date().isBefore(dto.start_date())) {
      throw new IllegalArgumentException("end_date must be >= start_date");
    }
    if (dto.periodicity() == Periodicity.SINGLE &&
        !dto.end_date().equals(dto.start_date())) {
      throw new IllegalArgumentException("For SINGLE periodicity, end_date must equal start_date");
    }

    // Validación de associated_to según scope
    if (dto.scope() == FeeScope.ALL) {
      if (dto.associated_to() != null && !dto.associated_to().isNull()) {
        throw new IllegalArgumentException("associated_to must be null when scope=ALL");
      }
    } else {
      // SCOUT | SECTION | SUBGROUP
      if (dto.associated_to() == null || dto.associated_to().isNull()
          || !dto.associated_to().hasNonNull("id")) {
        throw new IllegalArgumentException("associated_to.id is required for scope=" + dto.scope());
      }
    }

    // -------- Concept (upsert por nombre) --------
    Concept concept = conceptRepo.findByNameIgnoreCase(dto.name())
        .orElseGet(() -> {
          Concept c = new Concept();
          c.setName(dto.name());
          c.setDescription(dto.description());
          c.setTenantId(tenantId);
          return conceptRepo.save(c);
        });
    if (concept.getTenantId() == null) {
      concept.setTenantId(tenantId);
      concept = conceptRepo.save(concept);
    }

    // -------- FeePlan base --------
    FeePlan fp = new FeePlan();
    fp.setConcept(concept);
    fp.setAmount(dto.amount());
    fp.setPeriodicity(dto.periodicity() != null ? dto.periodicity().name() : null);
    fp.setScope(dto.scope() != null ? dto.scope().name() : null);
    fp.setStartDate(dto.start_date());
    fp.setEndDate(dto.end_date());

    fp.setTenantId(tenantId);

    // Tomar associated_to directamente del DTO (enrich opcional del "name" si viene vacío)
    JsonNode associatedTo = dto.associated_to(); // puede ser null en scope=ALL

    // -------- Resolución de targets según scope --------
    // Para SCOUT/SECTION/SUBGROUP usaremos el id dentro de associated_to
    String assocId = (associatedTo != null && !associatedTo.isNull() && associatedTo.hasNonNull("id"))
        ? associatedTo.get("id").asText()
        : null;

    List<MemberView> targets = switch (dto.scope()) {
      case ALL      -> memberRepo.findScoutsByTenant(tenantId);
      case SCOUT    -> memberRepo.findScoutById(tenantId, assocId);
      case SECTION  -> {
        Long sectionId = null;
        try {
          sectionId = Long.valueOf(assocId);
        } catch (NumberFormatException e) {
          throw new IllegalArgumentException("associated_to.id must be a valid Long for scope=SECTION");
        }
        yield memberRepo.findScoutsBySection(tenantId, sectionId);
      }
      case SUBGROUP -> {
        Long subgroupId = null;
        try {
          subgroupId = Long.valueOf(assocId);
        } catch (NumberFormatException e) {
          throw new IllegalArgumentException("associated_to.id must be a valid Long for scope=SUBGROUP");
        }
        yield memberRepo.findScoutsBySubgroup(tenantId, subgroupId);
      }
    };

    if (dto.scope() != FeeScope.ALL && (targets == null || targets.isEmpty())) {
      throw new IllegalArgumentException("No targets found for the provided associated_to.id / scope.");
    }

    // Si el scope NO es ALL y el "name" no vino, intentamos enriquecerlo (opcional)
    if (dto.scope() == FeeScope.SCOUT && associatedTo != null &&
        (!associatedTo.hasNonNull("name") || associatedTo.get("name").asText().isBlank())) {
      var t = targets.get(0);
      String fullName = (t.getFirstName() != null ? t.getFirstName() : "")
          + (t.getLastName() != null ? " " + t.getLastName() : "");
      com.fasterxml.jackson.databind.node.ObjectNode n =
          (associatedTo.isObject() ? (com.fasterxml.jackson.databind.node.ObjectNode) associatedTo
                                  : new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode());
      n.put("id", assocId);
      n.put("name", fullName.trim().isEmpty() ? null : fullName.trim());
      associatedTo = n;
    }
    // (Para SECTION/SUBGROUP podrías enriquecer nombre con consultas auxiliares si lo necesitas)

    fp.setAssociatedTo(associatedTo);
    feePlanRepo.save(fp);

    // -------- Calendario por periodicidad --------
    List<LocalDate> schedule = buildSchedule(dto.periodicity(), dto.start_date(), dto.end_date());

    // -------- Crear installments (amount = valor por cuota) --------
    for (MemberView m : targets) {
      Account acc = accountRepo.findByUserIdAndActiveTrue(m.getUserId())
          .orElseGet(() -> {
            Account a = new Account();
            a.setUserId(m.getUserId());
            a.setActive(true);
            a.setTenantId(tenantId);
            return accountRepo.save(a);
          });

      List<Installment> toCreate = new ArrayList<>();
      for (LocalDate due : schedule) {
        Installment inst = new Installment(
            acc.getAccountId(),
            concept.getConceptId(),
            due,
            dto.amount()
        );
        inst.setTenantId(tenantId); // propaga tenant al installment
        toCreate.add(inst);
      }
      installmentRepo.saveAll(toCreate);
    }

    // -------- DTO de salida (miembro solo si SCOUT) --------
    MemberPaymentDto member = null;
    if (dto.scope() == FeeScope.SCOUT && !targets.isEmpty()) {
      member = mapper.toMemberDto(targets.get(0));
    }
    return mapper.toCuotaDto(fp, member);
  }

  // ---------------------------------------------------------------------
  // GET Listados de Cuotas y miembros separados.
  // ---------------------------------------------------------------------

  @Override
  @Transactional(readOnly = true)
  public List<CuotaDto> listFeesByTenant(String tenantId) {
    // FeePlans cuyo Concept pertenece al tenant
    return feePlanRepo.findByConcept_TenantId(tenantId).stream()
        .map(mapper::toCuotaDto) // mapea associatedTo directamente
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<MemberPaymentDto> listMembersByTenant(String tenantId) {
    // Sólo miembros con jerarquía (subgrupo/ sección).
    return memberRepo.findHierarchyByTenant(tenantId).stream()
        .map(mapper::toMemberDto)
        .toList();
  }

  // ---------------------------------------------------------------------
  // GET Listados de Subgrupos y Ramas por tenant.
  // ---------------------------------------------------------------------

  @Override
  @Transactional(readOnly = true)
  public List<IdNameDto> listSubgroupsByTenant(String tenantId) {
    List<IdNameProjection> rows = memberRepo.findDistinctSubgroupsByTenant(tenantId);
    return rows.stream()
        .map(r -> new IdNameDto(r.getId(), r.getName()))
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<IdNameDto> listSectionsByTenant(String tenantId) {
    List<IdNameProjection> rows = memberRepo.findDistinctSectionsByTenant(tenantId);
    return rows.stream()
        .map(r -> new IdNameDto(r.getId(), r.getName()))
        .collect(Collectors.toList());
  }

  // ---------------------------------------------------------------------
  // PATCH
  // ---------------------------------------------------------------------
  @Override
  public CuotaDto patch(Long feePlanId, CuotaDto patch, String tenantId) {
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

          // Actualizar TODOS los installments vinculados a este concepto
          List<Installment> installments = installmentRepo.findByConceptId(c.getConceptId());

          for (Installment inst : installments) {
              inst.setAmount(patch.amount());
          }
          installmentRepo.saveAll(installments);
      }

      // Otros campos (scope, periodicity, fechas) no se modifican en patch

      return mapper.toCuotaDto(fp, (MemberPaymentDto) null);
  }
  // ---------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------
  @Override
  public void deleteFeePlan(Long feePlanId, String tenantId) {
      // 1) Validar pertenencia al tenant
      FeePlan fp = feePlanRepo.findByFeePlanIdAndConcept_TenantId(feePlanId, tenantId)
          .orElseThrow(() -> new NoSuchElementException("FeePlan not found for this tenant"));

      Concept concept = fp.getConcept();

      // 2) Borrar installments ligados al concept
      List<Installment> related = installmentRepo.findByConceptId(concept.getConceptId());
      if (!related.isEmpty()) {
          installmentRepo.deleteAll(related);
      }

      // 3) Borrar el fee plan
      feePlanRepo.delete(fp);

      // 4) Si el concepto ya no está asociado a ningún fee plan, eliminarlo
      boolean stillUsed = feePlanRepo.existsByConcept(concept);
      if (!stillUsed) {
          conceptRepo.delete(concept);
      }
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
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
}
