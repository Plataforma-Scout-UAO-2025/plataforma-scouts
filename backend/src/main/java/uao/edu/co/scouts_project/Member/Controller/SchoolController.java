package uao.edu.co.scouts_project.Member.Controller;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.Member.Dto.SchoolDto;
import uao.edu.co.scouts_project.Member.Mapper.SchoolMapper;
import uao.edu.co.scouts_project.Member.Model.MemberModel;
import uao.edu.co.scouts_project.Member.Model.SchoolModel;
import uao.edu.co.scouts_project.Member.Repository.IMemberRepository;
import uao.edu.co.scouts_project.Member.Service.ISchoolService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controlador REST para la gestión de entidades School.
 *
 * Expone endpoints para crear, listar y actualizar registros
 * relacionados con la información académica de los miembros.
 *
 * Utiliza DTOs para la comunicación entre capas y MapStruct
 * para la conversión entre entidades y DTOs.
 *
 * Endpoints disponibles:
 * - POST /api/schools/create_school_data
 * - GET  /api/schools/get_school_data_by_memberId({id}
 * - PUT  /api/schools/update_school_data_by_id/{id}
 */
@Slf4j
@RestController
@RequestMapping("/api/school_data")
@RequiredArgsConstructor
public class SchoolController {

    private final ISchoolService schoolService;
    private final IMemberRepository memberRepository;

    /**
     * Crea un nuevo registro escolar para un miembro.
     *
     * @param dto Objeto SchoolDto con los datos de la institución, curso y calendario.
     * @return ResponseEntity con el estado de la operación y el objeto creado en formato DTO.
     *
     * Posibles respuestas:
     * - 200 OK: Registro escolar creado exitosamente.
     * - 400 Bad Request: El miembro asociado no existe o los datos son inválidos.
     */

    @PostMapping("/create_school_data")
    public ResponseEntity<SchoolDto> create_school_data(@RequestBody SchoolDto dto) {
        Optional<MemberModel> memberOpt = memberRepository.findById(dto.getIdentification());
        if (memberOpt.isEmpty()) {
            log.warn("No se encontró el miembro con id={}", dto.getIdentification());
            return ResponseEntity.badRequest().build();
        }

        SchoolModel saved = schoolService.create_school(
                SchoolMapper.toEntity(dto, memberOpt.get())
        );
        return ResponseEntity.ok(SchoolMapper.toDto(saved));
    }

    /**
     * Lista todos los registros escolares de un miembro específico.
     *
     * @param member_id ID único del miembro.
     * @return ResponseEntity con la lista de registros escolares asociados al miembro en formato DTO.
     *
     * Posibles respuestas:
     * - 200 OK: Lista de registros obtenida exitosamente.
     * - 404 Not Found: El miembro no tiene registros escolares.
     */
    @GetMapping("/get_school_data_by_memberId/{id}")
    public ResponseEntity<List<SchoolDto>> get_school_data_by_memberId(@PathVariable("id") Integer member_id) {
        List<SchoolDto> schools = schoolService.find_by_identification(member_id)
                .stream()
                .map(SchoolMapper::toDto)
                .collect(Collectors.toList());

        if (schools.isEmpty()) {
            log.warn("No se encontraron registros escolares para el memberId={}", member_id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(schools);
    }


    /**
     * Actualiza un registro escolar existente según su ID.
     *
     * @param id  ID único del registro escolar a actualizar.
     * @param dto Objeto SchoolDto con los datos actualizados.
     * @return ResponseEntity con el registro actualizado en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Registro escolar actualizado correctamente.
     * - 400 Bad Request: El miembro asociado no existe.
     * - 404 Not Found: No existe un registro escolar con el ID especificado.
     */
    @PutMapping("/update_school_data_by_id/{id}")
    public ResponseEntity<SchoolDto> update_school_data_by_id(@PathVariable Long id, @RequestBody SchoolDto dto) {
        Optional<MemberModel> memberOpt = memberRepository.findById(dto.getIdentification());
        if (memberOpt.isEmpty()) {
            log.warn("No se encontró el miembro con id={}", dto.getIdentification());
            return ResponseEntity.badRequest().build();
        }

        return schoolService.update_school_by_id(id,
                        SchoolMapper.toEntity(dto, memberOpt.get()))
                .map(updated -> ResponseEntity.ok(SchoolMapper.toDto(updated)))
                .orElse(ResponseEntity.notFound().build());
    }
}
