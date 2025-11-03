package uao.edu.co.scouts_project.member.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.member.dto.*;
import uao.edu.co.scouts_project.member.mapper.MemberMapper;
import uao.edu.co.scouts_project.member.mapper.ListMemberMapper;
import uao.edu.co.scouts_project.member.mapper.SchoolDataMapper;
import uao.edu.co.scouts_project.member.mapper.UpdateMemberMapper;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.service.IMemberService;
import uao.edu.co.scouts_project.member.service.ISchoolService;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;
import uao.edu.co.scouts_project.organigrama.service.GroupService;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import java.util.stream.Collectors;
import java.util.*;

/**
 * ================================================================
 * CONTROLADOR: MemberController
 * DESCRIPCIÓN: Gestiona las operaciones CRUD y consultas
 * relacionadas con miembros, datos escolares y subgrupos.
 * BASE URL: /api/v1/members
 * ================================================================
 * ENDPOINTS DISPONIBLES:
 * POST → /create_member — Crear miembro
 * POST → /create_member_with_school — Crear miembro + datos escolares
 * GET → /list_members — Listar todos los miembros
 * GET → /list_member_by_id?id={id} — Buscar miembro por ID
 * GET → /list_members_by_subgroup?id={id} — Miembros por subgrupo
 * GET → /list_members_by_status?status={status} — Filtrar por estado
 * GET → /list_subGroup_by_memberId?id={id} — Subgrupo por miembro
 * GET → /list_schoolData_by_memberId?id={id} — Datos escolares
 * GET → /list_members_with_details — Listar miembros con detalles
 * PUT → /update_member_status/{id}?status={status} — Actualizar estado
 * PUT → /update_member_by_id/{id} — Actualizar información completa
 * PUT → /update_role — Actualizar role con base al rol de Auth0
 * PUT → /assign_subgroup_and_section — Asigna la seccion y el sub grupo a un
 * miembro
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    @Autowired
    private IMemberService memberservice;

    @Autowired
    private ISchoolService schoolservice;

    @Autowired
    private SubgroupService subgroupService;

    @Autowired
    private GroupService groupService;

    /**
     * Obtiene el nombre de usuario autenticado desde el contexto de seguridad.
     *
     * @return nombre del usuario autenticado
     */
    private static String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Crea un nuevo miembro en el sistema.
     *
     * @param miembroDto datos del miembro a registrar
     * @return miembro creado con código 201 (CREATED)
     */
    @PostMapping("/create_member")
    public ResponseEntity<MemberDto> create_member(@Valid @RequestBody MemberDto miembroDto) {
        String username = getCurrentUsername();
        log.info("Usuario autenticado: {} - Creando miembro: {}", username, miembroDto.getIdentification());

        Member miembro = MemberMapper.toEntity(miembroDto);
        Member miembroRegistrado = memberservice.create_member(miembro);
        MemberDto response = MemberMapper.toDto(miembroRegistrado);

        log.info("Miembro creado exitosamente con ID: {}", response.getMemberId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Crea un miembro junto con sus datos escolares en una sola transacción.
     *
     * @param request DTO combinado que incluye miembro y datos escolares
     * @return respuesta con ambos objetos creados
     */
    @PostMapping("/create_member_with_school")
    @Transactional
    public ResponseEntity<Map<String, Object>> create_member_with_school(
            @Valid @RequestBody CreateMemberWithSchoolDto request) {

        MemberDto memberDto = request.getMember();
        SchoolDataDto schoolDto = request.getSchool();

        log.info("Creando miembro con datos escolares. Identificación: {}", memberDto.getIdentification());

        Member miembro = MemberMapper.toEntity(memberDto);
        Member savedMember = memberservice.create_member(miembro);

        SchoolData schoolData = SchoolDataMapper.toEntity(
                schoolDto,
                savedMember.getMemberId(),
                savedMember.getTenantId());
        SchoolData savedSchool = schoolservice.create_school(schoolData);

        Map<String, Object> response = Map.of(
                "member", MemberMapper.toDto(savedMember),
                "school", SchoolDataMapper.toDto(savedSchool),
                "message", "Miembro y datos escolares creados exitosamente");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todos los miembros registrados en el sistema.
     *
     * @return lista de miembros (puede ser vacía)
     */
    @GetMapping("/list_members")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members() {
        List<Member> members = memberservice.get_members();
        List<ListMemberDto> membersDto = members != null
                ? members.stream().map(ListMemberMapper::toDto).toList()
                : Collections.emptyList();
        return ResponseEntity.ok(membersDto);
    }

    /**
     * Busca un miembro por su ID.
     *
     * @param memberId identificador del miembro
     * @return información del miembro o 404 si no existe
     */
    @GetMapping("/list_member_by_id")
    @Transactional(readOnly = true)
    public ResponseEntity<ListMemberDto> list_member_by_id(@RequestParam("id") Long memberId) {
        Optional<Member> memberOpt = memberservice.get_member_by_id(memberId);
        return memberOpt.map(member -> ResponseEntity.ok(ListMemberMapper.toDto(member)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Lista los miembros que pertenecen a un subgrupo específico.
     *
     * @param subGroupId identificador del subgrupo
     * @return lista de miembros del subgrupo
     */
    @GetMapping("/list_members_by_subgroup")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members_by_subGroup(@RequestParam("id") Long subGroupId) {
        Optional<List<Member>> membersOpt = memberservice.get_members_by_subGroupId(subGroupId);
        List<ListMemberDto> memberDtos = membersOpt.orElse(Collections.emptyList())
                .stream().map(ListMemberMapper::toDto).toList();
        return ResponseEntity.ok(memberDtos);
    }

    /**
     * Lista los miembros filtrados por su estado.
     *
     * @param status estado a filtrar (ej. ACTIVE, INACTIVE)
     * @return lista de miembros filtrada por estado
     */
    @GetMapping("/list_members_by_status")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members_by_status(@RequestParam String status) {
        List<ListMemberDto> membersDto = memberservice.get_members_by_status(status)
                .stream().map(ListMemberMapper::toDto).toList();
        return ResponseEntity.ok(membersDto);
    }

    /**
     * Obtiene el subgrupo al que pertenece un miembro.
     *
     * @param memberId ID del miembro
     * @return subgrupo correspondiente o 404 si no existe
     */
    @GetMapping("/list_subGroup_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<Subgroup> list_subGroup_by_memberId(@RequestParam("id") Long memberId) {
        Optional<Subgroup> subgroupOpt = subgroupService.getSubgroupByMemberId(memberId);
        return subgroupOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Obtiene los datos escolares de un miembro específico.
     *
     * @param memberId ID del miembro
     * @return datos escolares o 404 si no existen
     */
    @GetMapping("/list_schoolData_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<SchoolDataDto> list_schoolData_by_memberId(@RequestParam("id") Long memberId) {
        Optional<SchoolData> schoolDataOpt = schoolservice.getSchoolDataByMemberId(memberId);
        return schoolDataOpt.map(schoolData -> ResponseEntity.ok(SchoolDataMapper.toDto(schoolData)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Lista todos los miembros del tenant autenticado con información completa
     * de subgrupo y sección.
     *
     * @return lista detallada de miembros o lista vacía
     */
    @GetMapping("/list_members_with_details")
    public ResponseEntity<List<MemberWithSubgroupAndSectionDto>> listMembersWithDetails() {

        log.info("Listando miembros con detalles completos para el usuario autenticado");

        try {
            List<MemberWithSubgroupAndSectionDto> members = memberservice.get_members_with_subgroup_and_section();

            if (members.isEmpty()) {
                log.info("No se encontraron miembros para el tenant del usuario autenticado");
                return ResponseEntity.ok(Collections.emptyList());
            }

            log.info("Se encontraron {} miembros con detalles completos", members.size());
            return ResponseEntity.ok(members);

        } catch (IllegalStateException e) {
            log.error("Error: No se pudo determinar la organizaci�n del usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error inesperado al listar miembros con detalles: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista todos los grupos y añade el miembro responsable (rol ADMIN_GRUPO)
     * asociado por tenant_id en la propiedad `inChargeOf`.
     *
     * @return lista de grupos enriquecidos con el admin grupal (si existe)
     */
    @GetMapping("/getAll")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        try {
            GroupResponseDTO[] groups = groupService.getAllGroups();

            // Obtener todos los miembros con rol ADMIN_GRUPO
            List<Member> admins = memberservice.findMembersByRole("ADMIN_GRUPO");

            // Map tenantId -> admin DTO (si hay varios, toma el primero)
            Map<String, ListMemberDto> adminByTenant = admins.stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toMap(Member::getTenantId,
                            ListMemberMapper::toDto,
                            (existing, replacement) -> existing));

            List<Map<String, Object>> result = new ArrayList<>();
            if (groups != null) {
                for (GroupResponseDTO g : groups) {
                    Map<String, Object> item = new HashMap<>();
                    // incluir la info del grupo (el DTO ya tiene la mayoría de campos solicitados)
                    item.put("group", g);
                    // agregar el encargado (puede ser null)
                    item.put("inChargeOf", adminByTenant.get(g.tenantId()));
                    result.add(item);
                }
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error al obtener grupos con admin: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Actualiza el estado de un miembro.
     *
     * @param memberId ID del miembro
     * @param status   nuevo estado a asignar (ej. ACTIVE, INACTIVE)
     * @return mensaje de confirmación
     */
    @PutMapping("/update_member_status/{id}")
    public ResponseEntity<Map<String, String>> update_member_status(
            @PathVariable("id") Long memberId, @RequestParam String status) {
        String normalizedStatus = status.trim().toUpperCase();
        Status enumStatus = Status.valueOf(normalizedStatus);
        memberservice.update_status(memberId, enumStatus);
        return ResponseEntity.ok(Map.of(
                "message", "Estado actualizado correctamente",
                "memberId", memberId.toString(),
                "newStatus", enumStatus.name()));
    }

    /**
     * Actualiza toda la información de un miembro existente.
     *
     * @param memberId  ID del miembro
     * @param updateDto DTO con los nuevos datos
     * @return miembro actualizado o 404 si no existe
     */
    @PutMapping("/update_member_by_id/{id}")
    public ResponseEntity<UpdateMemberDto> update_member_by_id(
            @PathVariable("id") Long memberId,
            @Valid @RequestBody UpdateMemberDto updateDto) {

        Member memberUpdate = UpdateMemberMapper.toEntity(updateDto);

        Member miembroActualizado = memberservice.update_member_by_id(memberId, memberUpdate);

        return ResponseEntity.ok(UpdateMemberMapper.toDto(miembroActualizado));
    }

    @PutMapping("/update_role")
    public ResponseEntity<Map<String, String>> updateMemberRole(
            @Valid @RequestBody UpdateRoleDto request) {

        boolean updated = memberservice.update_role(
                request.getMemberId(),
                request.getNewRole());

        if (updated) {
            return ResponseEntity.ok(Map.of(
                    "message", "Rol actualizado correctamente",
                    "memberId", request.getMemberId().toString(),
                    "newRole", request.getNewRole()));
        } else {
            return ResponseEntity.ok(Map.of(
                    "message", "El rol ya estaba actualizado o el miembro no existe",
                    "memberId", request.getMemberId().toString()));
        }
    }

    /**
     * Asigna un subgrupo y una sección a un miembro dentro de una transacción.
     *
     * @param request DTO con memberId, subGroupId y sectionId
     * @return mensaje de éxito o error
     */
    @PutMapping("/assign_subgroup_and_section")
    @Transactional
    public ResponseEntity<Map<String, String>> assign_subgroup_and_section(
            @Valid @RequestBody AssignSubgroupAndSectionDto request) {
        Long memberId = request.getMemberId();
        Long subgroupId = request.getSubGroupId();
        Long sectionId = request.getSectionId();

        boolean assigned = memberservice.assignSubgroupAndSection(memberId, subgroupId, sectionId);

        if (assigned) {
            return ResponseEntity.ok(Map.of(
                    "message", "Subgrupo y sección asignados correctamente",
                    "memberId", memberId.toString(),
                    "subgroupId", subgroupId.toString(),
                    "sectionId", sectionId.toString()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se pudo asignar el subgrupo y la sección. Verifique los datos."));
        }
    }

}