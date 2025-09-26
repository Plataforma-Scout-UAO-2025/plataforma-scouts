package uao.edu.co.scouts_project.Miembros.Controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.Miembros.Dto.MiembroDto;
import uao.edu.co.scouts_project.Miembros.Dto.MiembroUpdateDto;
import uao.edu.co.scouts_project.Miembros.Mapper.MiembroMapper;
import uao.edu.co.scouts_project.Miembros.Mapper.MiembroUpdateMapper;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;
import uao.edu.co.scouts_project.Miembros.Service.IMiembroService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para la gestión de miembros.
 *
 * Expone endpoints para crear, listar, actualizar miembros
 * de la base de datos. Utiliza DTOs para la comunicación
 * entre capas y mantiene la conversión con un Mapper.
 *
 * Endpoints disponibles:
 * - POST /api/miembros/crear
 * - GET  /api/miembros/listar
 * - GET  /api/miembros/listar_por_id/{id}
 * - PUT /api/miembros/actualizar_estado/{id}
 * - PUT /api/miembros/actualizar_por_id/{id}
 *
 */

@Slf4j
@RestController
@RequestMapping("/api/miembros")
public class MiembroController {

    @Autowired
    private IMiembroService miembroService;

    @Autowired
    private MiembroMapper miembroMapper;

    @Autowired
    private MiembroUpdateMapper miembroUpdateMapper;

    /**
     * Crea un nuevo miembro en el sistema.
     *
     * @param miembroDto Objeto con la información del miembro a registrar.
     * @return ResponseEntity con el estado de la operación y el objeto creado.
     *
     * Posibles respuestas:
     * - 201 Created: Miembro creado exitosamente.
     * - 400 Bad Request: Error de validación en los datos de entrada.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */

    @PostMapping("/crear")
    public ResponseEntity<?> crearMiembro(@Valid @RequestBody MiembroDto miembroDto) {
        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", miembroDto.getIdentificacion());

            // Convertir DTO a entidad para persistencia
            MiembroModel miembro = miembroMapper.toEntity(miembroDto);

            // Guardar en la base de datos
            MiembroModel miembroRegistrado = miembroService.crearMiembro(miembro);

            // Convertir la entidad persistida de vuelta a DTO
            MiembroDto miembroRegistradoDto = miembroMapper.toDto(miembroRegistrado);

            log.info("Miembro creado exitosamente: {}", miembroRegistradoDto.getIdentificacion());
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
     * Lista todos los miembros registrados en el sistema.
     *
     * @return ResponseEntity con la lista de miembros en formato DTO.
     *
     * Posibles respuestas:
     * - 200 OK: Lista de miembros obtenida exitosamente.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @GetMapping("/listar")
    public ResponseEntity<?> listarMiembros() {
        try {
            List<MiembroModel> miembros = miembroService.listarMiembros();
            List<MiembroDto> miembrosDto = miembros.stream()
                    .map(miembroMapper::toDto)
                    .toList();

            return ResponseEntity.ok(miembrosDto);
        } catch (Exception e) {
            log.error("Error al listar los miembros", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los miembros"));
        }
    }


    /**
     * Obtiene un miembro por su identificación.
     *
     * @param idMiembro ID único del miembro.
     * @return ResponseEntity con el miembro en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Miembro encontrado y retornado exitosamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     */
    @GetMapping("/listar_por_id/{id}")
    public ResponseEntity<?> obtenerMiembroPorId(@PathVariable("id") Long idMiembro) {
        return miembroService.obtenerMiembroPorId(idMiembro)
                .map(miembro -> ResponseEntity.ok(miembroMapper.toDto(miembro))) // entity → dto
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((MiembroDto) Map.of("error", "Miembro no encontrado con ID " + idMiembro)));
    }


    /**
     * Actualiza el estado de un miembro (ACEPTADO o NO_ACEPTADO).
     *
     * @param idMiembro ID único del miembro.
     * @param estado    Nuevo estado a asignar al miembro.
     * @return ResponseEntity con un mensaje de éxito o error.
     *
     * Posibles respuestas:
     * - 200 OK: Estado actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/actualizar_estado/{id}")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable("id") Long idMiembro,
            @RequestParam Estado estado) {
        try {
            Boolean actualizado = miembroService.actualizarEstado(idMiembro, estado);

            if (actualizado) {
                return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + idMiembro));
            }

        } catch (Exception e) {
            log.error("Error al actualizar el estado del miembro con ID {}", idMiembro, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }


    /**
     * Actualiza la información de un miembro existente.
     *
     * @param idMiembro        ID único del miembro a actualizar.
     * @param miembroUpdateDto Datos nuevos del miembro en formato DTO.
     * @return ResponseEntity con el miembro actualizado en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Miembro actualizado correctamente.
     * - 404 Not Found: No existe un miembro con el ID especificado.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarMiembro(
            @PathVariable("id") Long idMiembro,
            @Valid @RequestBody MiembroUpdateDto miembroUpdateDto) {
        try {
            MiembroModel miembroUpdate = miembroUpdateMapper.toEntity(miembroUpdateDto);

            Optional<MiembroModel> miembroActualizado = miembroService.actualizarMiembro(idMiembro, miembroUpdate);

            if (miembroActualizado.isPresent()) {
                return ResponseEntity.ok(miembroUpdateMapper.toDto(miembroActualizado.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Miembro no encontrado con ID " + idMiembro));
            }

        } catch (Exception e) {
            log.error("Error al actualizar el miembro con ID {}", idMiembro, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }


    /**
     * Lista los miembros filtrados por estado (ACEPTADO o NO_ACEPTADO).
     *
     * @param estado Estado de los miembros a listar.
     * @return ResponseEntity con la lista de miembros en formato DTO o un mensaje de error.
     *
     * Posibles respuestas:
     * - 200 OK: Lista de miembros obtenida correctamente.
     * - 400 Bad Request: El estado no es válido.
     * - 500 Internal Server Error: Error inesperado en el servidor.
     */
    @GetMapping("/listar/por/estado")
    public ResponseEntity<?> listarMiembrosPorEstado(@RequestParam Estado estado) {
        try {
            List<MiembroModel> miembros = miembroService.listarMiembrosPorEstado(estado);
            List<MiembroDto> miembrosDto = miembros.stream()
                    .map(miembroMapper::toDto)
                    .toList();

            return ResponseEntity.ok(miembrosDto);
        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido recibido: {}", estado);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Estado inválido: " + estado));
        } catch (Exception e) {
            log.error("Error al listar los miembros por estado {}", estado, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar los miembros por estado"));
        }
    }

}


