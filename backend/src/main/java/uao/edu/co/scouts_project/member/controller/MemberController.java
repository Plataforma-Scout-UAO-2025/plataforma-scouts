package uao.edu.co.scouts_project.member.controller;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

import java.util.*;

/**
 * ================================================================
 *  CONTROLADOR: MemberController
 *  DESCRIPCIÓN: Gestiona las operaciones CRUD y consultas
 *  relacionadas con miembros, datos escolares y subgrupos.
 *  BASE URL: /api/v1/members
 * ================================================================
 *   ENDPOINTS DISPONIBLES:
 *   POST    → /create_member — Crear miembro
 *   POST    → /create_member_with_school — Crear miembro + datos escolares
 *   GET     → /list_members — Listar todos los miembros
 *   GET     → /list_member_by_id?id={id} — Buscar miembro por ID
 *   GET     → /list_members_by_subgroup?id={id} — Miembros por subgrupo
 *   GET     → /list_members_by_status?status={status} — Filtrar por estado
 *   GET     → /list_subGroup_by_memberId?id={id} — Subgrupo por miembro
 *   GET     → /list_schoolData_by_memberId?id={id} — Datos escolares
 *   GET     → /list_members_with_details — Listar miembros con detalles
 *   PUT     → /update_member_status/{id}?status={status} — Actualizar estado
 *   PUT     → /update_member_by_id/{id} — Actualizar información completa
 *   PUT     → /assign_subgroup_and_section — Asigna la seccion y el sub grupo a un miembro
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
                savedMember.getTenantId()
        );
        SchoolData savedSchool = schoolservice.create_school(schoolData);

        Map<String, Object> response = Map.of(
                "member", MemberMapper.toDto(savedMember),
                "school", SchoolDataMapper.toDto(savedSchool),
                "message", "Miembro y datos escolares creados exitosamente"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    /**
     * Lista todos los miembros registrados en el sistema.
     *
     * @return lista de miembros (puede ser vacía)
     */
    @GetMapping("/list_members")
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
        try {
            List<MemberWithSubgroupAndSectionDto> members =
                    memberservice.get_members_with_subgroup_and_section();
            return ResponseEntity.ok(members);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
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
                "newStatus", enumStatus.name()
        ));
    }

    /**
     * Actualiza información de un miembro existente (actualización parcial).
     * Solo actualiza los campos que vengan informados en el DTO.
     *
     * @param memberId   ID del miembro
     * @param updateDto  DTO con los campos a actualizar
     * @return miembro actualizado o 404 si no existe
     */
    @PutMapping("/update_member_by_id/{id}")
    public ResponseEntity<MemberDto> update_member_by_id(
            @PathVariable("id") Long memberId,
            @Valid @RequestBody UpdateMemberDto updateDto) {

        Member memberUpdate = UpdateMemberMapper.toEntity(updateDto);

        Member miembroActualizado = memberservice.update_member_by_id(memberId, memberUpdate);

        return ResponseEntity.ok(MemberMapper.toDto(miembroActualizado));
    }

    /**
     * Asigna un subgrupo y una sección a un miembro dentro de una transacción.
     *
     * @param request DTO con memberId, subGroupId y sectionId
     * @return mensaje de éxito o error
     */
    @PutMapping("/assign_subgroup_and_section")
    public ResponseEntity<Map<String, String>> assign_subgroup_and_section(@Valid @RequestBody AssignSubgroupAndSectionDto request) {
        Long memberId = request.getMemberId();
        Long subgroupId = request.getSubGroupId();
        Long sectionId = request.getSectionId();

        boolean assigned = memberservice.assignSubgroupAndSection(memberId, subgroupId, sectionId);

        if (assigned) {
            return ResponseEntity.ok(Map.of(
                    "message", "Subgrupo y sección asignados correctamente",
                    "memberId", memberId.toString(),
                    "subgroupId", subgroupId.toString(),
                    "sectionId", sectionId.toString()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se pudo asignar el subgrupo y la sección. Verifique los datos."));
        }
    }

}