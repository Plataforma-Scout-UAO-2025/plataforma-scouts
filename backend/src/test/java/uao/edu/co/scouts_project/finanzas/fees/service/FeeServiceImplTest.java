package uao.edu.co.scouts_project.finanzas.fees.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;
import uao.edu.co.scouts_project.finanzas.fees.data.TestData;
import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.mapper.FeeMapper;
import uao.edu.co.scouts_project.finanzas.fees.model.*;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.FeeScope;
import uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity;
import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;
import uao.edu.co.scouts_project.finanzas.fees.repository.*;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.IdNameProjection;
import uao.edu.co.scouts_project.finanzas.fees.service.impl.FeeServiceImpl;

@ExtendWith(MockitoExtension.class)
class FeeServiceImplTest {

  @Mock IConceptRepository conceptRepo;
  @Mock IFeePlanRepository feePlanRepo;
  @Mock IMemberReadRepository memberRepo;
  @Mock IAccountRepository accountRepo;
  @Mock IInstallmentRepository installmentRepo;

  @Spy  FeeMapper mapper; // <= usamos implementación real del mapper

  @InjectMocks FeeServiceImpl service;

  private final ObjectMapper om = new ObjectMapper();

  @BeforeEach
  void setup() { }

  // ---------- Validaciones básicas ----------

  @Test
  void create_SINGLE_falla_si_rango_invalido() {
    var dto = new CreateCuotaDto(
        "org_TENANT", "X", "desc", new BigDecimal("100"),
        Periodicity.SINGLE, FeeScope.ALL,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-02"),
        null
    );
    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("SINGLE");
  }

  @Test
  void create_ALL_falla_si_associatedTo_no_es_null() {
    ObjectNode at = om.createObjectNode();
    at.put("id", "anything");
    var dto = new CreateCuotaDto(
        "org_TENANT", "X", "desc", new BigDecimal("100"),
        Periodicity.MONTH, FeeScope.ALL,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-03-01"),
        at
    );
    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to must be null");
  }

  @Test
  void create_SCOUT_falla_si_associatedTo_id_faltante() {
    ObjectNode at = om.createObjectNode(); // sin id
    var dto = new CreateCuotaDto(
        "org_TENANT", "X", "desc", new BigDecimal("100"),
        Periodicity.SINGLE, FeeScope.SCOUT,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );
    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.id is required");
  }

  @Test
  void create_SECTION_falla_si_associatedTo_id_invalido() {
    // Arrange
    var at = om.createObjectNode();
    at.put("id", "NO_NUMERICO"); // inválido para SECTION (debe poder parsear a Long)

    var dto = new CreateCuotaDto(
        "org_TENANT",
        "Cuota sección",
        "desc",
        new BigDecimal("10.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SECTION,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    // Simula upsert del Concept
    Concept concept = new Concept();
    concept.setConceptId(10L);
    concept.setTenantId("org_TENANT");
    concept.setName(dto.name());
    concept.setDescription(dto.description());

    // NO exista => lo crea
    when(conceptRepo.findByNameIgnoreCase(dto.name())).thenReturn(Optional.empty());
    when(conceptRepo.save(any(Concept.class))).thenReturn(concept);

    // Act + Assert
    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.id must be a valid Long for scope=SECTION");

    // Verifica que no intente buscar miembros (se aborta antes por el parseo)
    verify(memberRepo, never()).findScoutsBySection(anyString(), anyLong());
  }

  @Test
  void create_SCOUT_falla_si_targets_vacio() {
    ObjectNode at = om.createObjectNode();
    at.put("id", "777");
    var dto = new CreateCuotaDto(
        "org_TENANT", "X", "desc", new BigDecimal("100"),
        Periodicity.SINGLE, FeeScope.SCOUT,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    Concept c = new Concept(); c.setConceptId(1L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("X")).thenReturn(Optional.of(c));
    when(memberRepo.findScoutById("org_TENANT", 777L)).thenReturn(List.of()); // vacío

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("No targets found");
  }

  // ---------- Creación ALL: upsert concept + calendario MONTH ----------

  @Test
  void create_ALL_creaConcept_siNoExiste_yGeneraInstallments_Month() {
    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota ALL", "desc", new BigDecimal("50000"),
        Periodicity.MONTH, FeeScope.ALL,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-06-01"),
        null
    );

    // Concept no existe -> se crea
    Concept concept = new Concept();
    concept.setConceptId(10L);
    concept.setTenantId("org_TENANT");
    concept.setName(dto.name());
    concept.setDescription(dto.description());
    when(conceptRepo.findByNameIgnoreCase(dto.name())).thenReturn(Optional.empty());
    when(conceptRepo.save(any(Concept.class))).thenReturn(concept);

    // 2 scouts en el tenant
    MemberView m1 = mock(MemberView.class); when(m1.getMemberId()).thenReturn(100L);
    MemberView m2 = mock(MemberView.class); when(m2.getMemberId()).thenReturn(101L);
    when(memberRepo.findScoutsByTenant("org_TENANT")).thenReturn(List.of(m1, m2));

    // cuentas ya existen
    Account a1 = new Account(); a1.setAccountId(1L); a1.setMemberId(100L); a1.setTenantId("org_TENANT"); a1.setActive(true);
    Account a2 = new Account(); a2.setAccountId(2L); a2.setMemberId(101L); a2.setTenantId("org_TENANT"); a2.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(100L)).thenReturn(Optional.of(a1));
    when(accountRepo.findByMemberIdAndActiveTrue(101L)).thenReturn(Optional.of(a2));

    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    CuotaDto out = service.create(dto);

    // Assert
    verify(conceptRepo).save(any(Concept.class));
    verify(feePlanRepo).save(argThat(fp ->
        fp.getConcept().getConceptId().equals(10L)
        && fp.getScope().equals(FeeScope.ALL.name())
        && fp.getAssociatedTo() == null
        && "org_TENANT".equals(fp.getTenantId())
    ));

    // Seis meses * 2 miembros -> dos llamadas a saveAll con 6 c/u
    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<Installment>> cap = ArgumentCaptor.forClass(List.class);
    verify(installmentRepo, times(2)).saveAll(cap.capture());

    int total = cap.getAllValues().stream().mapToInt(List::size).sum();
    assertThat(total).isEqualTo(12);

    // chequeo de campos mínimos del installment
    cap.getAllValues().forEach(batch -> batch.forEach(inst -> {
      assertThat(inst.getTenantId()).isEqualTo("org_TENANT");
      assertThat(inst.getAmount()).isEqualByComparingTo("50000");
      assertThat(inst.getBalance()).isEqualByComparingTo("50000");
      assertThat(inst.getStatus()).isEqualTo("PENDING");
      assertThat(inst.getPayments()).isNotNull();
      assertThat(inst.getConceptId()).isEqualTo(10L);
      assertThat(inst.getDueDate()).isNotNull();
    }));

    assertThat(out).isNotNull();
  }

  // ---------- SCOUT: normaliza associated_to.name cuando falta ----------

  @Test
  void create_SCOUT_normaliza_associatedTo_nameCuandoFalta() {
    var at = om.createObjectNode();
    at.put("id", "777"); // falta "name"

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota scout", "desc", new BigDecimal("2.00"),
        Periodicity.SINGLE, FeeScope.SCOUT,
        LocalDate.parse("2025-04-01"),
        LocalDate.parse("2025-04-01"),
        at
    );

    Concept concept = new Concept();
    concept.setConceptId(10L);
    concept.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Cuota scout")).thenReturn(Optional.of(concept));

    // Target
    MemberView mv = mock(MemberView.class);
    when(mv.getMemberId()).thenReturn(777L);
    // si tu normalización usa first/last name, puedes stubbearlos
    when(mv.getFirstName()).thenReturn("Camila");
    when(mv.getLastName()).thenReturn("Mendoza");
    when(memberRepo.findScoutById("org_TENANT", 777L)).thenReturn(List.of(mv));

    Account a = new Account(); a.setAccountId(1L); a.setMemberId(777L); a.setTenantId("org_TENANT"); a.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(777L)).thenReturn(Optional.of(a));
    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    service.create(dto);

    // Assert: el FeePlan guardado debe traer "name" completado
    verify(feePlanRepo).save(argThat(fp -> {
      var node = fp.getAssociatedTo();
      return node != null
          && node.hasNonNull("id")
          && node.hasNonNull("name")
          && "777".equals(node.get("id").asText())
          && !node.get("name").asText().isBlank();
    }));
  }

  // ---------- SECTION y SUBGROUP: rutas de targets y casting de id ----------

  @Test
  void create_SECTION_ok_generando_cuotas_SINGLE() {
    var at = om.createObjectNode();
    at.put("id", "55"); // sectionId (Long)
    at.put("name", "Manada");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota seccion", "desc", new BigDecimal("10.00"),
        Periodicity.SINGLE, FeeScope.SECTION,
        LocalDate.parse("2025-03-01"),
        LocalDate.parse("2025-03-01"),
        at
    );

    Concept c = new Concept(); c.setConceptId(5L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Cuota seccion")).thenReturn(Optional.of(c));

    MemberView m1 = mock(MemberView.class); when(m1.getMemberId()).thenReturn(10L);
    MemberView m2 = mock(MemberView.class); when(m2.getMemberId()).thenReturn(11L);
    when(memberRepo.findScoutsBySection("org_TENANT", 55L)).thenReturn(List.of(m1, m2));

    Account a1 = new Account(); a1.setAccountId(1L); a1.setMemberId(10L); a1.setTenantId("org_TENANT"); a1.setActive(true);
    Account a2 = new Account(); a2.setAccountId(2L); a2.setMemberId(11L); a2.setTenantId("org_TENANT"); a2.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(10L)).thenReturn(Optional.of(a1));
    when(accountRepo.findByMemberIdAndActiveTrue(11L)).thenReturn(Optional.of(a2));

    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    service.create(dto);

    // SINGLE => 1 cuota por target
    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<Installment>> cap = ArgumentCaptor.forClass(List.class);
    verify(installmentRepo, times(2)).saveAll(cap.capture());
    int total = cap.getAllValues().stream().mapToInt(List::size).sum();
    assertThat(total).isEqualTo(2);
  }

  @Test
  void create_SUBGROUP_ok_generando_cuotas_YEAR() {
    var at = om.createObjectNode();
    at.put("id", "77"); // subgroupId
    at.put("name", "Subgrupo Alfa");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota Subgrupo", "desc", new BigDecimal("1.00"),
        Periodicity.YEAR, FeeScope.SUBGROUP,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2027-01-01"), // 3 años inclusive (2025, 2026, 2027 si tu lógica incluye el end)
        at
    );

    Concept c = new Concept(); c.setConceptId(9L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Cuota Subgrupo")).thenReturn(Optional.of(c));

    MemberView m1 = mock(MemberView.class); when(m1.getMemberId()).thenReturn(10L);
    when(memberRepo.findScoutsBySubgroup("org_TENANT", 77L)).thenReturn(List.of(m1));

    Account a1 = new Account(); a1.setAccountId(1L); a1.setMemberId(10L); a1.setTenantId("org_TENANT"); a1.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(10L)).thenReturn(Optional.of(a1));

    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    service.create(dto);

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<Installment>> cap = ArgumentCaptor.forClass(List.class);
    verify(installmentRepo).saveAll(cap.capture());

    // según tu buildSchedule(YEAR) cuenta años inclusivos (ver tu helper)
    assertThat(cap.getValue().size()).isGreaterThanOrEqualTo(3);
  }

  // ---------- listFeesByTenant: mapea feePlans del tenant ----------

  @Test
  void listFeesByTenant_ok() {
    Concept c = new Concept(); c.setConceptId(3L); c.setTenantId("org_T");
    c.setName("C1"); c.setDescription("D1");

    FeePlan f1 = new FeePlan(); f1.setFeePlanId(1L); f1.setConcept(c); f1.setTenantId("org_T");
    f1.setAmount(new BigDecimal("10")); f1.setPeriodicity(Periodicity.MONTH.name());
    f1.setScope(FeeScope.ALL.name()); f1.setStartDate(LocalDate.now()); f1.setEndDate(LocalDate.now());

    when(feePlanRepo.findByConcept_TenantId("org_T")).thenReturn(List.of(f1));

    var out = service.listFeesByTenant("org_T");
    assertThat(out).hasSize(1);
    assertThat(out.get(0).name()).isEqualTo("C1");
    assertThat(out.get(0).description()).isEqualTo("D1");
  }

  @Test
  void create_ALL_rechaza_associatedTo_noNulo() {
    var dtoBase = TestData.createALL("org_TENANT");
    // meter associated_to indebido
    var at = new ObjectMapper().createObjectNode();
    at.put("id","1"); at.put("name","X");
    var dto = new CreateCuotaDto(
        dtoBase.tenant_id(), dtoBase.name(), dtoBase.description(),
        dtoBase.amount(), dtoBase.periodicity(), dtoBase.scope(),
        dtoBase.start_date(), dtoBase.end_date(), at
    );
    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to must be null when scope=ALL");
  }

  @Test
  void create_lanzaError_siEndDateEsAntesDeStartDate() {
    var dto = new CreateCuotaDto(
        "org_TENANT", "Concept X", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.ALL,
        LocalDate.parse("2025-02-01"),
        LocalDate.parse("2025-01-01"),
        null
    );

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("end_date must be >= start_date");
  }

  @Test
  void create_seteaTenantEnConceptSiVieneNull_yGuarda() {
    var dto = TestData.createALL("org_TENANT");

    // concept sin tenant (dispara rama concept.getTenantId() == null)
    Concept concept = new Concept();
    concept.setConceptId(99L); // cualquiera
    concept.setTenantId(null);
    concept.setName(dto.name());
    concept.setDescription(dto.description());

    when(conceptRepo.findByNameIgnoreCase(dto.name())).thenReturn(Optional.of(concept));
    when(conceptRepo.save(any(Concept.class))).thenAnswer(inv -> {
      Concept c = inv.getArgument(0);
      if (c.getTenantId() == null) c.setTenantId("org_TENANT");
      return c;
    });

    // 1 scout target para que siga el flujo
    MemberView mv = mock(MemberView.class);
    when(mv.getMemberId()).thenReturn(123L);
    when(memberRepo.findScoutsByTenant("org_TENANT")).thenReturn(List.of(mv));

    Account a = new Account(); a.setAccountId(1L); a.setMemberId(123L); a.setTenantId("org_TENANT"); a.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(123L)).thenReturn(Optional.of(a));
    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    // mapper leniente para evitar problemas de overloading
    CuotaDto cuotaMock = mock(CuotaDto.class);
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), any(MemberPaymentDto.class));
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), isNull());

    var out = service.create(dto);

    assertThat(out).isNotNull();
    verify(conceptRepo, atLeast(1)).save(argThat(c -> "org_TENANT".equals(c.getTenantId())));
  }

  @Test
  void create_SCOUT_lanzaError_siAssociatedIdNoEsLong() {
    var at = om.createObjectNode();
    at.put("id", "no-num"); // provoca NumberFormatException
    at.put("name", "Cami");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SCOUT,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.id must be a valid Long for scope=SCOUT");
  }

  @Test
  void create_SUBGROUP_lanzaError_siAssociatedIdNoEsLong() {
    var at = om.createObjectNode();
    at.put("id", "abc"); // no numérico
    at.put("name", "Subgrupo X");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SUBGROUP,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.id must be a valid Long for scope=SUBGROUP");
  }

  @Test
  void create_lanzaError_siAssociatedToNoEsObjetoJson() {
    // array en vez de objeto
    JsonNode notObject = om.createArrayNode().add("x");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SECTION,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        notObject
    );

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to must be a JSON object when scope=SECTION");
  }

  @Test
  void create_lanzaError_siAssociatedToIdVacio() {
    var at = om.createObjectNode();
    at.put("id", ""); // id vacío
    at.put("name", "Algo");

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SECTION,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.id is required and non-empty");
  }

  @Test
  void create_SECTION_sinName_ySinSectionNameEnMember_lanzaErrorNameRequerido() {
    var at = om.createObjectNode();
    at.put("id", "123"); // válido
    // sin "name"

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SECTION,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    // concept existente
    Concept c = new Concept(); c.setConceptId(1L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Cuota")).thenReturn(Optional.of(c));

    // target member (mock sin método getSectionName => reflection dará excepción)
    MemberView mv = mock(MemberView.class);
    when(memberRepo.findScoutsBySection("org_TENANT", 123L)).thenReturn(List.of(mv));

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.name is required and non-empty for scope=SECTION");
  }

  @Test
  void create_SUBGROUP_sinName_ySinSubgroupNameEnMember_lanzaErrorNameRequerido() {
    var at = om.createObjectNode();
    at.put("id", "45");
    // sin "name"

    var dto = new CreateCuotaDto(
        "org_TENANT", "Cuota", "desc", new BigDecimal("1.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.SINGLE,
        FeeScope.SUBGROUP,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-01-01"),
        at
    );

    Concept c = new Concept(); c.setConceptId(1L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Cuota")).thenReturn(Optional.of(c));

    MemberView mv = mock(MemberView.class);
    when(memberRepo.findScoutsBySubgroup("org_TENANT", 45L)).thenReturn(List.of(mv));

    assertThatThrownBy(() -> service.create(dto))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("associated_to.name is required and non-empty for scope=SUBGROUP");
  }

  @Test
  void create_creaAccountSiNoExisteParaTarget() {
    var dto = TestData.createALL("org_TENANT");

    Concept c = new Concept(); c.setConceptId(5L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase(dto.name())).thenReturn(Optional.of(c));

    MemberView mv = mock(MemberView.class);
    when(mv.getMemberId()).thenReturn(999L);
    when(memberRepo.findScoutsByTenant("org_TENANT")).thenReturn(List.of(mv));

    // no existe cuenta -> fuerza orElseGet()
    when(accountRepo.findByMemberIdAndActiveTrue(999L)).thenReturn(Optional.empty());
    when(accountRepo.save(any(Account.class))).thenAnswer(inv -> {
      Account a = inv.getArgument(0);
      a.setAccountId(77L);
      return a;
    });

    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    CuotaDto cuotaMock = mock(CuotaDto.class);
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), any(MemberPaymentDto.class));
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class));
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), isNull());

    var out = service.create(dto);
    assertThat(out).isNotNull();
    verify(accountRepo).save(argThat(a ->
        a.getMemberId().equals(999L) && a.isActive() && "org_TENANT".equals(a.getTenantId())
    ));
  }

  @Test
  void listSubgroupsByTenant_mapeaProyeccionesCorrectamente() {
    IdNameProjection p1 = new IdNameProjection() {
      public Long getId() { return 10L; }
      public String getName() { return "Albatros"; }
    };
    IdNameProjection p2 = new IdNameProjection() {
      public Long getId() { return 20L; }
      public String getName() { return "Leones"; }
    };
    when(memberRepo.findDistinctSubgroupsByTenant("org_TENANT")).thenReturn(List.of(p1, p2));

    var out = service.listSubgroupsByTenant("org_TENANT");
    assertThat(out).extracting("id").containsExactly(10L, 20L);
    assertThat(out).extracting("name").containsExactly("Albatros", "Leones");
  }

  @Test
  void listSectionsByTenant_mapeaProyeccionesCorrectamente() {
    IdNameProjection p1 = new IdNameProjection() {
      public Long getId() { return 1L; }
      public String getName() { return "Manada"; }
    };
    IdNameProjection p2 = new IdNameProjection() {
      public Long getId() { return 2L; }
      public String getName() { return "Tropa"; }
    };
    when(memberRepo.findDistinctSectionsByTenant("org_TENANT")).thenReturn(List.of(p1, p2));

    var out = service.listSectionsByTenant("org_TENANT");
    assertThat(out).extracting("id").containsExactly(1L, 2L);
    assertThat(out).extracting("name").containsExactly("Manada", "Tropa");
  }

@Test
void patch_soloActualizaConcepto_cuandoAmountEsNull() {
  var fp = new FeePlan();
  var c  = new Concept(); c.setConceptId(55L);
  fp.setConcept(c);

  when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(9L, "org_TENANT"))
      .thenReturn(Optional.of(fp));

  var patch = new CuotaDto(9L, null, "Nuevo Nombre", "Nueva Desc",
      null, null, null, null, null);

  CuotaDto cuotaMock = mock(CuotaDto.class);
  doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), isNull());

  var out = service.patch(9L, patch, "org_TENANT");

  assertThat(out).isNotNull();
  verify(conceptRepo).save(argThat(x ->
      "Nuevo Nombre".equals(x.getName()) && "Nueva Desc".equals(x.getDescription())
  ));
  verify(installmentRepo, never()).findByConceptId(anyLong());
  verify(installmentRepo, never()).saveAll(anyList());
}

  @Test
  void patch_actualizaMonto_yPropagaInstallments() {
    var fp = new FeePlan();
    var c  = new Concept(); c.setConceptId(77L);
    fp.setConcept(c);

    when(feePlanRepo.findByFeePlanIdAndConcept_TenantId(7L, "org_TENANT"))
        .thenReturn(Optional.of(fp));
    when(installmentRepo.findByConceptId(77L)).thenReturn(List.of(new Installment(), new Installment()));

    var patch = new CuotaDto(7L, new BigDecimal("123.45"), null, null,
        null, null, null, null, null);

    CuotaDto cuotaMock = mock(CuotaDto.class);
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), isNull());

    var out = service.patch(7L, patch, "org_TENANT");

    assertThat(out).isNotNull();
    verify(feePlanRepo).save(fp);
    verify(installmentRepo).findByConceptId(77L);
    // capturar que instalments recibieron nuevo monto
    ArgumentCaptor<List<Installment>> cap = ArgumentCaptor.forClass(List.class);
    verify(installmentRepo).saveAll(cap.capture());
    assertThat(cap.getValue()).hasSize(2);
  }

  @Test
  void create_ALL_periodicidad_QUARTER_generatesFechasTrimestrales() {
    var dto = new CreateCuotaDto(
        "org_TENANT", "Concept Q", "desc", new BigDecimal("10.00"),
        uao.edu.co.scouts_project.finanzas.fees.model.enums.Periodicity.QUARTER,
        FeeScope.ALL,
        LocalDate.parse("2025-01-01"),
        LocalDate.parse("2025-10-01"),
        null
    );

    Concept c = new Concept(); c.setConceptId(5L); c.setTenantId("org_TENANT");
    when(conceptRepo.findByNameIgnoreCase("Concept Q")).thenReturn(Optional.of(c));

    MemberView mv = mock(MemberView.class);
    when(mv.getMemberId()).thenReturn(500L);
    when(memberRepo.findScoutsByTenant("org_TENANT")).thenReturn(List.of(mv));

    Account acc = new Account(); acc.setAccountId(11L); acc.setMemberId(500L); acc.setTenantId("org_TENANT"); acc.setActive(true);
    when(accountRepo.findByMemberIdAndActiveTrue(500L)).thenReturn(Optional.of(acc));
    when(feePlanRepo.save(any(FeePlan.class))).thenAnswer(inv -> inv.getArgument(0));

    // mapper leniente
    CuotaDto cuotaMock = mock(CuotaDto.class);
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), any(MemberPaymentDto.class));
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class));
    doReturn(cuotaMock).when(mapper).toCuotaDto(any(FeePlan.class), isNull());

    service.create(dto);

    ArgumentCaptor<List<Installment>> cap = ArgumentCaptor.forClass(List.class);
    verify(installmentRepo).saveAll(cap.capture());
    // 2025-01-01, 2025-04-01, 2025-07-01, 2025-10-01 => 4
    assertThat(cap.getValue()).hasSize(4);
  }


  
}

