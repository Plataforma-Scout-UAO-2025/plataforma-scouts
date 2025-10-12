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
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.service.IMemberService;
import uao.edu.co.scouts_project.member.service.ISchoolService;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;

import java.util.*;

/**
 * Controlador REST para la gestión de miembros.
 * Expone endpoints para crear, listar y actualizar miembros en el sistema.
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

    private static String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Crea un nuevo miembro en el sistema.
     * @Valid activa las validaciones del DTO automáticamente.
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
     * Crea un nuevo miembro junto con sus datos escolares.
     * Operación transaccional: si falla alguna parte, se revierte todo.
     */
    @PostMapping("/create_member_with_school")
    @Transactional
    public ResponseEntity<Map<String, Object>> create_member_with_school(
            @Valid @RequestBody CreateMemberWithSchoolDto request) {
        
        MemberDto memberDto = request.getMember();
        SchoolDataDto schoolDto = request.getSchool();

        log.info("Creando miembro con datos escolares. Identificación: {}", memberDto.getIdentification());

        // Crear miembro
        Member miembro = MemberMapper.toEntity(memberDto);
        Member savedMember = memberservice.create_member(miembro);
        log.info("Miembro creado con ID: {}", savedMember.getMemberId());

        // Crear datos escolares
        SchoolData schoolData = SchoolDataMapper.toEntity(
                schoolDto,
                savedMember.getMemberId(),
                savedMember.getTenantId()
        );
        SchoolData savedSchool = schoolservice.create_school(schoolData);
        log.info("Datos escolares creados para member_id: {}", savedMember.getMemberId());

        Map<String, Object> response = Map.of(
                "member", MemberMapper.toDto(savedMember),
                "school", SchoolDataMapper.toDto(savedSchool),
                "message", "Miembro y datos escolares creados exitosamente"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todos los miembros registrados.
     * Devuelve 200 con lista vacía si no hay miembros (en lugar de 404).
     */
    @GetMapping("/list_members")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members() {
        log.debug("Consultando lista de todos los miembros");
        
        List<Member> members = memberservice.get_members();
        
        // Retorna lista vacía con 200 OK si no hay miembros
        List<ListMemberDto> membersDto = members != null 
                ? members.stream().map(ListMemberMapper::toDto).toList()
                : Collections.emptyList();

        log.info("Se encontraron {} miembros", membersDto.size());
        return ResponseEntity.ok(membersDto);
    }

    /**
     * Obtiene un miembro por su ID.
     * Devuelve 404 solo si el miembro realmente no existe.
     */
    @GetMapping("/list_member_by_id")
    @Transactional(readOnly = true)
    public ResponseEntity<ListMemberDto> list_member_by_id(@RequestParam("id") Long memberId) {
        log.debug("Buscando miembro con ID: {}", memberId);
        
        Optional<Member> memberOpt = memberservice.get_member_by_id(memberId);

        return memberOpt
                .map(member -> {
                    log.info("Miembro encontrado: {}", memberId);
                    return ResponseEntity.ok(ListMemberMapper.toDto(member));
                })
                .orElseGet(() -> {
                    log.warn("No existe miembro con ID: {}", memberId);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Obtiene los miembros de un subgrupo específico.
     * Devuelve 200 con lista vacía si no hay miembros en el subgrupo.
     */
    @GetMapping("/list_members_by_subgroup")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members_by_subGroup(@RequestParam("id") Long subGroupId) {
        log.debug("Buscando miembros del subgrupo: {}", subGroupId);
        
        Optional<List<Member>> membersOpt = memberservice.get_members_by_subGroupId(subGroupId);

        List<ListMemberDto> memberDtos = membersOpt
                .orElse(Collections.emptyList())
                .stream()
                .map(ListMemberMapper::toDto)
                .toList();

        log.info("Se encontraron {} miembros para el subgrupo {}", memberDtos.size(), subGroupId);
        return ResponseEntity.ok(memberDtos);
    }

    /**
     * Lista miembros filtrados por estado.
     * La validación del enum se hace en el servicio/mapper.
     */
    @GetMapping("/list_members_by_status")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ListMemberDto>> list_members_by_status(@RequestParam String status) {
        log.debug("Buscando miembros con estado: {}", status);
        
        List<ListMemberDto> membersDto = memberservice.get_members_by_status(status)
                .stream()
                .map(ListMemberMapper::toDto)
                .toList();

        log.info("Se encontraron {} miembros con estado {}", membersDto.size(), status);
        return ResponseEntity.ok(membersDto);
    }

    /**
     * Obtiene el subgrupo al que pertenece un miembro.
     */
    @GetMapping("/list_subGroup_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<Subgroup> list_subGroup_by_memberId(@RequestParam("id") Long memberId) {
        log.debug("Buscando subgrupo del miembro: {}", memberId);
        
        Optional<Subgroup> subgroupOpt = subgroupService.getSubgroupByMemberId(memberId);

        return subgroupOpt
                .map(subgroup -> {
                    log.info("Subgrupo encontrado para miembro {}", memberId);
                    return ResponseEntity.ok(subgroup);
                })
                .orElseGet(() -> {
                    log.warn("No se encontró subgrupo para miembro {}", memberId);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Obtiene los datos escolares de un miembro.
     */
    @GetMapping("/list_schoolData_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<SchoolDataDto> list_schoolData_by_memberId(@RequestParam("id") Long memberId) {
        log.debug("Buscando datos escolares del miembro: {}", memberId);
        
        Optional<SchoolData> schoolDataOpt = schoolservice.getSchoolDataByMemberId(memberId);

        return schoolDataOpt
                .map(schoolData -> {
                    log.info("Datos escolares encontrados para miembro {}", memberId);
                    return ResponseEntity.ok(SchoolDataMapper.toDto(schoolData));
                })
                .orElseGet(() -> {
                    log.info("No hay datos escolares para miembro {}", memberId);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Actualiza el estado de un miembro.
     * Normaliza el status a mayúsculas para evitar errores de case-sensitivity.
     */
    @PutMapping("/update_member_status/{id}")
    public ResponseEntity<Map<String, String>> update_member_status(
            @PathVariable("id") Long memberId,
            @RequestParam String status) {

        log.info("Actualizando estado del miembro {} a {}", memberId, status);

        String normalizedStatus = status.trim().toUpperCase();
        Status enumStatus = Status.valueOf(normalizedStatus);

        memberservice.update_status(memberId, enumStatus);

        log.info("Estado actualizado exitosamente para miembro {}", memberId);
        return ResponseEntity.ok(Map.of(
                "message", "Estado actualizado correctamente",
                "memberId", memberId.toString(),
                "newStatus", enumStatus.name()
        ));
    }

    /**
     * Actualiza la información completa de un miembro.
     */
    @PutMapping("/update_member_by_id/{id}")
    public ResponseEntity<MemberDto> update_member_by_id(
            @PathVariable("id") Long memberId,
            @Valid @RequestBody MemberDto memberUpdateDto) {
        
        log.info("Actualizando información del miembro {}", memberId);

        Member miembroUpdate = MemberMapper.toEntity(memberUpdateDto);
        Member miembroActualizado = memberservice.update_member_by_id(memberId, miembroUpdate);

        if (miembroActualizado != null) {
            log.info("Miembro {} actualizado exitosamente", memberId);
            return ResponseEntity.ok(MemberMapper.toDto(miembroActualizado));
        } else {
            log.warn("No se encontró miembro con ID {}", memberId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Asigna un subgrupo a un miembro.
     */
    @PutMapping("/assign_subgroup")
    @Transactional
    public ResponseEntity<Map<String, String>> assignSubgroup(
            @Valid @RequestBody AssignSubgroupDto request) {
        
        Long memberId = request.getMemberId();
        Long subgroupId = request.getSubGroupId();

        log.info("Asignando subgrupo {} al miembro {}", subgroupId, memberId);

        boolean assigned = memberservice.assign_subGroup(memberId, subgroupId);

        if (assigned) {
            log.info("Subgrupo asignado exitosamente");
            return ResponseEntity.ok(Map.of(
                    "message", "Subgrupo asignado correctamente",
                    "memberId", memberId.toString(),
                    "subgroupId", subgroupId.toString()
            ));
        } else {
            log.warn("No se pudo asignar subgrupo {} al miembro {}", subgroupId, memberId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se pudo asignar el subgrupo. Verifique los datos o el estado del subgrupo."));
        }
    }
}