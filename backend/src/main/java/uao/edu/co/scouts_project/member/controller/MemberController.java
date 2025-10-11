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
 * Controlador REST para la gestión de members.
 * Expone endpoints para crear, listar, actualizar members
 * de la base de datos. Utiliza DTOs para la comunicación
 * entre capas y mantiene la conversión con un Mapper.
 * Endpoints disponibles:
 * - POST /api/v1/members/create_member
 * - POST /api/v1/members/create_member_with_school
 * - GET /api/v1/members/list_members
 * - GET /api/v1/members/list_member_by_id
 * - GET /api/v1/members/list_member_by_subGroupId
 * - GET /api/v1/members/list_members_by_status
 * - GET /api/v1/members/list_subGroup_by_memberId
 * - GET /api/v1/members/list_schoolData_by_memberId
 * - PUT /api/v1/members/update_member_status/{id}
 * - PUT /api/v1/members/update_member_by_id/{id}
 * - PUT /api/v1/members/asign_subgroup/{id}
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

            SchoolData savedSchool = schoolservice.create_school(schoolData);

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
     * Lista todos los miembros registrados en el sistema.
     *
     * @return ResponseEntity con la lista de miembros en formato DTO.
     * Posibles respuestas:
     * - 200 OK: Miembros encontrados.
     * - 404 Not Found: No existen miembros registrados.
     * - 500 Internal Server Error: Error interno al procesar la solicitud.
     */
    @GetMapping("/list_members")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_members() {
        try {
            List<Member> members = memberservice.get_members();

            if (members == null || members.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No existen miembros registrados"));
            }

            List<ListMemberDto> membersDto = members.stream()
                    .map(ListMemberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(membersDto);

        } catch (Exception e) {
            log.error("Error al listar los miembros", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los miembros"));
        }
    }



    /**
     * Obtiene un miembro por su identificación.
     *
     * @param memberId ID único del miembro.
     * @return ResponseEntity con el miembro en formato DTO o un mensaje de error.
     * Posibles respuestas:
     * - 200 OK: Miembro encontrado y retornado exitosamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error interno al procesar la solicitud.
     */
    @GetMapping("/list_member_by_id")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_member_by_id(@RequestParam("id") Long memberId) {
        try {
            Optional<Member> memberOpt = memberservice.get_member_by_id(memberId);

            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No existe un miembro con el ID " + memberId));
            }

            ListMemberDto memberDto = ListMemberMapper.toDto(memberOpt.get());

            return ResponseEntity.ok(memberDto);

        } catch (Exception e) {
            log.error("Error al obtener el miembro por ID {}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener el miembro por su ID"));
        }
    }


    /**
     * Obtiene los miembros que pertenecen a un subGrupo dado.
     *
     * @param subGroupId ID único del subGrupo.
     * @return ResponseEntity con la lista de miembros en formato DTO.

     * Posibles respuestas:
     * - 200 OK: Miembros encontrados.
     * - 404 Not Found: No existen miembros para el ID dado.
     * - 500 Internal Server Error: Error interno al procesar la solicitud.
     */
    @GetMapping("/list_members_by_subGroup")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_members_by_subGroup(@RequestParam("id") Long subGroupId) {
        try {
            Optional<List<Member>> membersOpt = memberservice.get_members_by_subGroupId(subGroupId);

            if (membersOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No existen miembros para el subGrupo con ID " + subGroupId));
            }

            List<ListMemberDto> memberDtos = membersOpt.get()
                    .stream()
                    .map(ListMemberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(memberDtos);

        } catch (Exception e) {
            log.error("Error al listar los miembros del subGrupo {}", subGroupId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los miembros del subGrupo"));
        }
    }

    /**
     * Lista los members filtrados por estado (PENDING, REJECTED o APPROVED).
     *
     * @param status Estado de los members a listar.
     * @return ResponseEntity con la lista de members en formato DTO o un mensaje de error.
     * Posibles respuestas:
     * - 200 OK: Lista de members obtenida correctamente.
     * - 400 Bad Request: El estado no es válido.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @GetMapping("/list_members_by_status")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_members_by_status(@RequestParam String status) {
        try {
            List<ListMemberDto> membersDto = memberservice.get_members_by_status(status)
                    .stream()
                    .map(ListMemberMapper::toDto)
                    .toList();

            return ResponseEntity.ok(membersDto);
        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido: {}", status);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al listar los members por estado {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los members por estado"));
        }
    }



    /**
     * Obtiene el subgroup al que pertenece un miembro dado su ID.
     *
     * @param member_id ID único del miembro.
     * @return ResponseEntity con los datos del subGrupo al cual pertenece el miembro
     * <p>
     * Posibles respuestas:
     * - 200 OK: SubGrupo encontrado exitosamente
     * - 404 Not Found: No existen datos de subgrupo para el miembro especificado
     */
    
    @GetMapping("/list_subGroup_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_subGroup_by_memberId(@RequestParam("id") Long member_id) {
        Optional<Subgroup> subgroupOpt = subgroupService.getSubgroupByMemberId(member_id);

        if (subgroupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No se encontró un subgroup asociado al miembro con ID " + member_id));
        }

        return ResponseEntity.ok(subgroupOpt.get());
    }


    /**
     * Obtiene los datos escolares asociados a un miembro específico.
     *
     * @param memberId ID único del miembro.
     * @return ResponseEntity con los datos escolares en formato DTO o un mensaje de error.
     * Posibles respuestas:
     * - 200 OK: Datos escolares encontrados y retornados exitosamente.
     * - 404 Not Found: No existen datos escolares para el miembro especificado.
     * - 500 Internal Server Error: Error interno al procesar la solicitud.
     */
    @GetMapping("/list_schoolData_by_memberId")
    @Transactional(readOnly = true)
    public ResponseEntity<?> list_schoolData_by_memberId(@RequestParam("id") Long memberId) {
        try {
            Optional<SchoolData> schoolDataOpt = schoolservice.getSchoolDataByMemberId(memberId);

            if (schoolDataOpt.isEmpty()) {
                log.info("No se encontraron datos escolares para el miembro con ID {}", memberId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No se encontraron datos escolares asociados al miembro con ID " + memberId));
            }

            SchoolDataDto schoolDataDto = SchoolDataMapper.toDto(schoolDataOpt.get());

            return ResponseEntity.ok(schoolDataDto);

        } catch (Exception e) {
            log.error("Error al obtener los datos escolares del miembro con ID {}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener los datos escolares del miembro"));
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


    /**
     * Asigna un subgrupo a un miembro específico.
     *
     * @param request DTO con los IDs del miembro y del subgrupo.
     * @return ResponseEntity con el resultado de la operación.
     * Posibles respuestas:
     * - 200 OK: Subgrupo asignado correctamente.
     * - 404 Not Found: Miembro o subgrupo no encontrado.
     * - 400 Bad Request: El subgrupo está inactivo o no se pudo asignar.
     * - 500 Internal Server Error: Error inesperado.
     */
    @PutMapping("/assign_subgroup")
    @Transactional
    public ResponseEntity<?> assignSubgroup(@RequestBody AssignSubgroupDto request) {
        try {
            Long memberId = request.getMemberId();
            Long subgroupId = request.getSubGroupId();

            boolean assigned = memberservice.assign_subGroup(memberId, subgroupId);

            if (assigned) {
                return ResponseEntity.ok(Map.of(
                        "message", "Subgrupo asignado correctamente al miembro con ID " + memberId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "No se pudo asignar el subgrupo. Verifique los datos o el estado del subgrupo."));
            }

        } catch (Exception e) {
            log.error("Error inesperado al asignar subgrupo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al asignar el subgrupo"));
        }
    }


}


