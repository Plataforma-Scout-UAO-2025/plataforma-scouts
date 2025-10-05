package uao.edu.co.scouts_project.member.Controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.member.Dto.MemberDto;
import uao.edu.co.scouts_project.member.Dto.MemberWithSchoolDto;
import uao.edu.co.scouts_project.member.Mapper.MemberMapper;
import uao.edu.co.scouts_project.member.Mapper.MemberWithSchoolMapper;
import uao.edu.co.scouts_project.member.Model.MemberModel;
import uao.edu.co.scouts_project.member.Model.SchoolModel;
import uao.edu.co.scouts_project.member.Repository.ISchoolRepository;
import uao.edu.co.scouts_project.member.Service.IMemberService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para la gestión de members.
 *
 * Expone endpoints para crear, listar, actualizar members
 * de la base de datos. Utiliza DTOs para la comunicación
 * entre capas y mantiene la conversión con un Mapper.
 *
 * Endpoints disponibles:
 * - POST /api/members/create_member
 * - GET  /api/members/list_members
 * - GET  /api/members/list_member_by_id/{id}
 * - GET /api/members/list_members_by_status
 * - PUT /api/members/update_member_status/{id}
 * - PUT /api/members/update_member_role/{id}
 * - PUT /api/members/update_member_by_id/{id}
 *
 *
 */

@Slf4j
@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private IMemberService memberservice;

    @Autowired
    private ISchoolRepository schoolRepository;


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
        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", miembroDto.getIdentification());

            MemberModel miembro = MemberMapper.toEntity(miembroDto);
            MemberModel miembroRegistrado = memberservice.create_member(miembro);
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
     * Lista todos los members registrados en el sistema.
     *
     * @return ResponseEntity con la lista de members en formato DTO.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Lista de members obtenida exitosamente.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
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
    public ResponseEntity<?> list_member_by_id(@RequestParam("id") Integer member_id) {
        Optional<MemberModel> memberOpt = memberservice.get_member_by_id(member_id);

        if (memberOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Miembro no encontrado con ID " + member_id));
        }

        return ResponseEntity.ok(MemberMapper.toDto(memberOpt.get()));
    }


    /**
     * Lista los members filtrados por estado (ACEPTADO o NO_ACEPTADO).
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
                    .body(Map.of("error", "Estado inválido: " + status));
        } catch (Exception e) {
            log.error("Error al listar los members por estado {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los members por estado"));
        }
    }




    /**
     * Actualiza el estado de un miembro (ACEPTADO o NO_ACEPTADO).
     *
     * @param member_id ID único del miembro.
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
            @PathVariable("id") Integer member_id,
            @RequestParam String status) {
        try {
            Boolean actualizado = memberservice.update_status(member_id, status);

            if (actualizado) {
                return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + member_id));
            }
        } catch (Exception e) {
            log.error("Error al actualizar el estado del miembro con ID {}", member_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }

    /**
     * Actualiza el rol de un miembro
     *
     * @param member_id ID único del miembro.
     * @param role    Nuevo rol a asignar al miembro.
     * @return ResponseEntity con un mensaje de éxito o error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Rol actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/update_member_role/{id}")
    public ResponseEntity<?> update_member_role(
            @PathVariable("id") Integer member_id,
            @RequestParam String role) {
        try {
            Boolean actualizado = memberservice.update_role(member_id, role);

            if (actualizado) {
                return ResponseEntity.ok(Map.of("mensaje", "Rol actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "El miembro ya cuenta con dicho rol" + member_id));
            }
        } catch (Exception e) {
            log.error("Error al actualizar el rol del miembro con ID {}", member_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }

    /**
     * Actualiza la información de un miembro existente.
     * @param member_id        ID único del miembro a actualizar.
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
            @PathVariable("id") Integer member_id,
            @Valid @RequestBody MemberDto memberUpdateDto) {
        try {
            MemberModel miembroUpdate = MemberMapper.toEntity(memberUpdateDto);

            Optional<MemberModel> miembroActualizado =
                    memberservice.update_member_by_id(member_id, miembroUpdate);

            if (miembroActualizado.isPresent()) {
                return ResponseEntity.ok(MemberMapper.toDto(miembroActualizado.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + member_id));
            }
        } catch (Exception e) {
            log.error("Error al actualizar el miembro con ID {}", member_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }

    /**
     * Crea un miembro junto con sus datos escolares en una única transacción.
     * Este endpoint es útil cuando se tiene toda la información disponible.
     *
     * @param dto DTO combinado con datos del miembro y escolares
     * @return ResponseEntity con ambos objetos creados o mensaje de error
     *
     * Posibles respuestas:
     * - 201 Created: Miembro y datos escolares creados exitosamente
     * - 400 Bad Request: Error de validación en los datos
     * - 500 Internal Server Error: Error inesperado
     */
    @PostMapping("/create_member_with_school")
    @Transactional
    public ResponseEntity<?> createMemberWithSchool(@Valid @RequestBody MemberWithSchoolDto dto) {
        try {
            log.info("Creando miembro con datos escolares: {}", dto.getIdentification());

            MemberModel member = MemberWithSchoolMapper.toEntity(dto);
            MemberModel savedMember = memberservice.create_member(member);
            log.info("Miembro creado con ID: {}", savedMember.getMember_id());

            SchoolModel schoolData = MemberWithSchoolMapper.toSchoolEntity(dto);
            SchoolModel savedSchool = null;

            if (schoolData != null) {
                schoolData.setMember(savedMember);
                savedSchool = schoolRepository.save(schoolData);
                log.info("Datos escolares creados para member_id: {}", savedMember.getMember_id());
            }

            MemberWithSchoolDto responseDto = MemberWithSchoolMapper.toDto(savedMember, savedSchool);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "data", responseDto,
                    "message", "Miembro creado exitosamente"
            ));

        } catch (IllegalArgumentException e) {
            log.warn("Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear miembro con datos escolares", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }
}



