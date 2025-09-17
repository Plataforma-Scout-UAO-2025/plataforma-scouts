package uao.edu.co.scouts_project.Miembros.Controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import uao.edu.co.scouts_project.Miembros.Dto.MiembroDto;
//import uao.edu.co.scouts_project.Miembros.Mapper.MiembroMapper;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;
import uao.edu.co.scouts_project.Miembros.Service.IMiembroService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/miembros")
public class MiembroController {

    @Autowired
    private IMiembroService miembroService;

    //@Autowired
    //private MiembroMapper miembroMapper;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarMiembro(@Valid @RequestBody MiembroModel miembroModel) {
        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", miembroModel.getIdentificacion());

            //MiembroModel miembro = miembroMapper.toEntity(miembroDto);

            MiembroModel miembroRegistrado = miembroService.registrarMiembro(miembroModel);

            //MiembroDto miembroRegistradoDto = miembroMapper.toDto(miembroRegistrado);

            log.info("Miembro pre registrado exitosamente: {}", miembroModel.getIdentificacion());
            return ResponseEntity.status(HttpStatus.CREATED).body(miembroModel);

        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al pre registar miembro: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error inesperado al pre registrar miembro", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }
}
