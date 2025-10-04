package uao.edu.co.scouts_project.finanzas.fees.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.FeeIndexResponse;
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
  // CREATE (con generación de installments)
  // ---------------------------------------------------------------------
  @Override
  public CuotaDto create(CreateCuotaDto dto) {
    final Long tenantId = dto.tenant_id();

    if (dto.end_date().isBefore(dto.start_date())) {
      throw new IllegalArgumentException("end_date must be >= start_date");
    }
    if (dto.periodicity() == Periodicity.SINGLE &&
        !dto.end_date().equals(dto.start_date())) {
      throw new IllegalArgumentException("For SINGLE periodicity, end_date must equal start_date");
    }
    if (dto.scope() == FeeScope.SCOUT && dto.target_member_id() == null) {
      throw new IllegalArgumentException("target_member_id is required for scope=SCOUT");
    }
    if (dto.scope() == FeeScope.SECTION && dto.section_id() == null) {
      throw new IllegalArgumentException("section_id is required for scope=SECTION");
    }
    if (dto.scope() == FeeScope.SUBGROUP && dto.subgroup_id() == null) {
      throw new IllegalArgumentException("subgroup_id is required for scope=SUBGROUP");
    }

    // Concept (upsert por nombre)
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

    // FeePlan (scope/periodicity como String en la entidad)
    FeePlan fp = new FeePlan();
    fp.setConcept(concept);
    fp.setAmount(dto.amount());
    fp.setPeriodicity(dto.periodicity() != null ? dto.periodicity().name() : null);
    fp.setScope(dto.scope() != null ? dto.scope().name() : null);
    fp.setStartDate(dto.start_date());
    fp.setEndDate(dto.end_date());
    fp.setTargetMemberId(dto.target_member_id());
    feePlanRepo.save(fp);

    // Miembros objetivo (rol SCOUT) según scope
    List<MemberView> targets = switch (dto.scope()) {
      case ALL      -> memberRepo.findScoutsByTenant(tenantId);
      case SCOUT    -> memberRepo.findScoutById(tenantId, dto.target_member_id());
      case SECTION  -> memberRepo.findScoutsBySection(tenantId, dto.section_id());
      case SUBGROUP -> memberRepo.findScoutsBySubgroup(tenantId, dto.subgroup_id());
    };

    // Calendario por periodicidad
    List<LocalDate> schedule = buildSchedule(dto.periodicity(), dto.start_date(), dto.end_date());

    // Crear installments: amount se interpreta como valor por cuota
    for (MemberView m : targets) {
      Account acc = accountRepo.findByMemberIdAndActiveTrue(m.getMemberId())
          .orElseGet(() -> {
            Account a = new Account();
            a.setMemberId(m.getMemberId());
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
        inst.setTenantId(tenantId);
        toCreate.add(inst);
      }
      installmentRepo.saveAll(toCreate);
    }

    MemberPaymentDto member = null;
    if (dto.scope() == FeeScope.SCOUT && !targets.isEmpty()) {
      member = mapper.toMemberDto(targets.get(0)); // sin jerarquía aquí
    }
    return mapper.toCuotaDto(fp, member);
  }

  // ---------------------------------------------------------------------
  // LIST por tenant (incluye subgroup/section id + name)
  // ---------------------------------------------------------------------
  @Transactional(readOnly = true)
  public FeeIndexResponse listAllByTenant(Long tenantId) {
    // 1) Traer miembros (rol SCOUT) con jerarquía (subgroup & section)
    List<MemberPaymentDto> members = memberRepo.findHierarchyByTenant(tenantId).stream()
        .map(mapper::toMemberDto)   // overload que recibe MemberHierarchyRow
        .collect(Collectors.toList());

    // 2) Traer cuotas del tenant (por tenant del concepto)
    var fees = feePlanRepo.findByConcept_TenantId(tenantId);

    // 3) Armar respuesta, inyectando miembro si scope=SCOUT y hay target
    List<CuotaDto> cuotas = fees.stream()
        .map(fp -> {
          MemberPaymentDto member = null;
          if (fp.getTargetMemberId() != null && FeeScope.SCOUT.name().equals(fp.getScope())) {
            member = members.stream()
                .filter(m -> Objects.equals(m.member_id(), fp.getTargetMemberId()))
                .findFirst()
                .orElse(null);
          }
          return mapper.toCuotaDto(fp, member);
        })
        .collect(Collectors.toList());

    return new FeeIndexResponse(cuotas, members);
  }

  // ---------------------------------------------------------------------
  // PATCH
  // ---------------------------------------------------------------------
  @Override
  public CuotaDto patch(Long feePlanId, CuotaDto patch, Long tenantId) {
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
  public void deleteFeePlan(Long feePlanId, Long tenantId) {
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
