package uao.edu.co.scouts_project.Member.Controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.Member.Dto.MemberDto;
import uao.edu.co.scouts_project.Member.Dto.MemberUpdateDto;
import uao.edu.co.scouts_project.Member.Mapper.MemberMapper;
import uao.edu.co.scouts_project.Member.Mapper.MemberUpdateMapper;
import uao.edu.co.scouts_project.Member.Model.Enums.Estado;
import uao.edu.co.scouts_project.Member.Model.MemberModel;
import uao.edu.co.scouts_project.Member.Service.IMemberService;

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
 * - GET /api/members/list_member_by_status
 * - PUT /api/members/update_status/{id}
 * - PUT /api/members/update_by_id/{id}
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
    private MemberMapper memberMapper;

    @Autowired
    private MemberUpdateMapper memberUpdateMapper;

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

    @PostMapping("/crear_miembro")
    public ResponseEntity<?> create_member(@Valid @RequestBody MemberDto miembroDto) {
        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", miembroDto.getIdentification());

            // Convertir DTO a entidad para persistencia
            MemberModel miembro = memberMapper.toEntity(miembroDto);

            // Guardar en la base de datos
            MemberModel miembroRegistrado = memberservice.create_member(miembro);

            // Convertir la entidad persistida de vuelta a DTO
            MemberDto miembroRegistradoDto = memberMapper.toDto(miembroRegistrado);

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
    @GetMapping("/listar_members")
    public ResponseEntity<?> list_members() {
        try {
            List<MemberModel> members = memberservice.list_members();
            List<MemberDto> membersDto = members.stream()
                    .map(memberMapper::toDto)
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
    @GetMapping("/listar_miembro_por_id/{id}")
    public ResponseEntity<?> list_members_by_id(@PathVariable("id") Integer member_id) {
        return memberservice.get_member_by_id(member_id)
                .map(miembro -> ResponseEntity.ok(memberMapper.toDto(miembro))) // entity → dto
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((MemberDto) Map.of("error", "Miembro no encontrado con ID " + member_id)));
    }


    /**
     * Lista los members filtrados por estado (ACEPTADO o NO_ACEPTADO).
     *
     * @param estado Estado de los members a listar.
     * @return ResponseEntity con la lista de members en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Lista de members obtenida correctamente.
     * - 400 Bad Request: El estado no es válido.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @GetMapping("/listar_members_por_estado")
    public ResponseEntity<?> list_members_by_status(@RequestParam Estado estado) {
        try {
            List<MemberModel> members = memberservice.list_members_by_status(estado);
            List<MemberDto> membersDto = members.stream()
                    .map(memberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(membersDto);
        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido recibido: {}", estado);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Estado inválido: " + estado));
        } catch (Exception e) {
            log.error("Error al listar los members por estado {}", estado, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los members por estado"));
        }
    }




    /**
     * Actualiza el estado de un miembro (ACEPTADO o NO_ACEPTADO).
     *
     * @param member_id ID único del miembro.
     * @param estado    Nuevo estado a asignar al miembro.
     * @return ResponseEntity con un mensaje de éxito o error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Estado actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/actualizar_miembro_estado/{id}")
    public ResponseEntity<?> update_status(
            @PathVariable("id") Integer member_id,
            @RequestParam Estado estado) {
        try {
            Boolean actualizado = memberservice.update_status(member_id, estado);

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
     * Actualiza la información de un miembro existente.
     * @param member_id        ID único del miembro a actualizar.
     * @param miembroUpdateDto Datos nuevos del miembro en formato DTO.
     * @return ResponseEntity con el miembro actualizado en formato DTO o un mensaje de error.
     * <p>
     * Posibles respuestas:
     * - 200 OK: Miembro actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/actualizar_miembro_por_id/{id}")
    public ResponseEntity<?> update_member_by_id(
            @PathVariable("id") Integer member_id,
            @Valid @RequestBody MemberUpdateDto miembroUpdateDto) {
        try {
            MemberModel miembroUpdate = memberUpdateMapper.toEntity(miembroUpdateDto);

            Optional<MemberModel> miembroActualizado = memberservice.update_member_by_id(member_id, miembroUpdate);

            if (miembroActualizado.isPresent()) {
                return ResponseEntity.ok(memberUpdateMapper.toDto(miembroActualizado.get()));
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
}



