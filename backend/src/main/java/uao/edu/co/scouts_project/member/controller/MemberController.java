package uao.edu.co.scouts_project.member.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.member.dto.MemberDto;
import uao.edu.co.scouts_project.member.dto.CreateMemberWithSchoolDto;
import uao.edu.co.scouts_project.member.dto.SchoolDataDto;
import uao.edu.co.scouts_project.member.mapper.MemberMapper;
import uao.edu.co.scouts_project.member.mapper.SchoolDataMapper;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.repository.ISchoolRepository;
import uao.edu.co.scouts_project.member.service.IMemberService;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.lang.String.format;

/**
 * Controlador REST para la gestión de members.
 * Expone endpoints para crear, listar, actualizar members
 * de la base de datos. Utiliza DTOs para la comunicación
 * entre capas y mantiene la conversión con un Mapper.
 * Endpoints disponibles:
 * - POST /api/members/create_member
 * - POST /api/members/create_member_with_school
 * - GET /api/members/list_members
 * - GET /api/members/list_member_by_id/{id}
 * - GET /api/members/list_members_by_status
 * - PUT /api/members/update_member_status/{id}
 * - PUT /api/members/update_member_by_id/{id}
 */

@Slf4j
@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    @Autowired
    private IMemberService memberservice;

    @Autowired
    private ISchoolRepository schoolRepository;

    private static String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Crea un nuevo miembro en el sistema.
     *
     * @param miembroDto Objeto con la información del miembro a registrar.
     * @return ResponseEntity con el estado de la operación y el objeto creado.
     * <p>
     * Posibles respuestas:
     * - 201 Created: Miembro creado exitosamente.
     * - 400 Bad Request: Error de validación en los datos de entrada.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PostMapping("/create_member")
    public ResponseEntity<?> create_member(@Valid @RequestBody MemberDto miembroDto) {

        String name = getCurrentUsername();
        log.info("Acceso para usuario autenticado: {}", name);

        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", miembroDto.getIdentification());

            Member miembro = MemberMapper.toEntity(miembroDto);
            Member miembroRegistrado = memberservice.create_member(miembro);
            MemberDto miembroRegistradoDto = MemberMapper.toDto(miembroRegistrado);

            log.info("Miembro creado exitosamente: {}", miembroRegistradoDto.getIdentification());
            return ResponseEntity.status(HttpStatus.CREATED).body(miembroRegistradoDto);

        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear al miembro: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al crear el miembro", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }



    /**
     * Crea un nuevo miembro en el sistema junto a sus datos escolares
     *
     * @param request DTo combinado con la información el miembro y su escuela a registrar
     * @return ResponseEntity con el estado de la operación y el objeto creado.
     * <p>
     * Posibles respuestas:
     * - 201 Created: Miembro creado exitosamente.
     * - 400 Bad Request: Error de validación en los datos de entrada.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PostMapping("/create_member_with_school")
    @Transactional
    public ResponseEntity<?> create_member_with_school(
            @Valid @RequestBody CreateMemberWithSchoolDto request) {
        try {
            MemberDto memberDto = request.getMember();
            SchoolDataDto schoolDto = request.getSchool();

            log.info("Creando miembro con identificación: {}", memberDto.getIdentification());

            Member miembro = MemberMapper.toEntity(memberDto);
            Member savedMember = memberservice.create_member(miembro);

            log.info("Miembro creado con ID: {}", savedMember.getMemberId());

            SchoolData schoolData = SchoolDataMapper.toEntity(
                    schoolDto,
                    savedMember.getMemberId(),
                    savedMember.getTenantId()
            );

            SchoolData savedSchool = schoolRepository.save(schoolData);

            log.info("Datos escolares creados para member_id: {}", savedMember.getMemberId());

            Map<String, Object> response = Map.of(
                    "member", MemberMapper.toDto(savedMember),
                    "school", SchoolDataMapper.toDto(savedSchool),
                    "message", "Miembro y datos escolares creados exitosamente"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            log.error("Error de seguridad: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error al crear miembro con datos escolares", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }


    /**
     * Lista todos los members registrados en el sistema.
     *
     * @return ResponseEntity con la lista de members en formato DTO.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Lista de members obtenida exitosamente.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @Transactional(readOnly = true)
    @GetMapping("/list_members")
    public ResponseEntity<?> list_members() {
        try {
            List<MemberDto> membersDto = memberservice.list_members()
                    .stream()
                    .map(MemberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(membersDto);
        } catch (Exception e) {
            log.error("Error al listar los members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los members"));
        }
    }


    /**
     * Obtiene un miembro por su identificación.
     *
     * @param member_id ID único del miembro.
     * @return ResponseEntity con el miembro en formato DTO o un mensaje de error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Miembro encontrado y retornado exitosamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     */
    @GetMapping("/list_member_by_id")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_member_by_id(@RequestParam("id") Long member_id) {
        Optional<Member> memberOpt = memberservice.get_member_by_id(member_id);

        if (memberOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Miembro no encontrado con ID " + member_id));
        }

        return ResponseEntity.ok(MemberMapper.toDto(memberOpt.get()));
    }


    /**
     * Lista los members filtrados por estado (PENDING, REJECTED o APPROVED).
     *
     * @param status Estado de los members a listar.
     * @return ResponseEntity con la lista de members en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Lista de members obtenida correctamente.
     * - 400 Bad Request: El estado no es válido.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @GetMapping("/list_members_by_status")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_members_by_status(@RequestParam String status) {
        try {
            List<MemberDto> membersDto = memberservice.list_members_by_status(status)
                    .stream()
                    .map(MemberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(membersDto);
        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido recibido: {}", status);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al listar los members por estado {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los members por estado"));
        }
    }





    /**
     * Actualiza el estado de un miembro (PENDING, REJECTED o APPROVED).
     *
     * @param memberId ID único del miembro.
     * @param status    Nuevo estado a asignar al miembro.
     * @return ResponseEntity con un mensaje de éxito o error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Estado actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/update_member_status/{id}")
    public ResponseEntity<?> update_member_status(
            @PathVariable("id") Long memberId,
            @RequestParam String status) {

        try {
            Status enumStatus = Arrays.stream(Status.values())
                    .filter(s -> s.name().equalsIgnoreCase(status))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Estado inválido: " + status));

            Boolean actualizado = memberservice.update_status(memberId, enumStatus);

            if (actualizado) {
                return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + memberId));
            }

        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido recibido: {}", status);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error al actualizar el estado del miembro con ID {}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }




    /**
     * Actualiza la información de un miembro existente.
     * @param memberId        ID único del miembro a actualizar.
     * @param memberUpdateDto Datos nuevos del miembro en formato DTO.
     * @return ResponseEntity con el miembro actualizado en formato DTO o un mensaje de error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Miembro actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */

    @PutMapping("/update_member_by_id/{id}")
    public ResponseEntity<?> update_member_by_id(
            @PathVariable("id") Long memberId,
            @Valid @RequestBody MemberDto memberUpdateDto) {
        try {
            Member miembroUpdate = MemberMapper.toEntity(memberUpdateDto);

            Optional<Member> miembroActualizado =
                    Optional.ofNullable(memberservice.update_member_by_id(memberId, miembroUpdate));

            if (miembroActualizado.isPresent()) {
                return ResponseEntity.ok(MemberMapper.toDto(miembroActualizado.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + memberId));
            }
        } catch (Exception e) {
            log.error("Error al actualizar el miembro con ID {}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }


}



