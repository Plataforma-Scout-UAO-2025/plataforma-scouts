package uao.edu.co.scouts_project.Members.Controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import uao.edu.co.scouts_project.Miembros.Dto.MiembroDto;
//import uao.edu.co.scouts_project.Miembros.Mapper.MiembroMapper;
import uao.edu.co.scouts_project.Members.Model.MemberModel;
import uao.edu.co.scouts_project.Members.Service.IMemberService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/miembros")
public class MemberController {

    @Autowired
    private IMemberService miembroService;

    //@Autowired
    //private MiembroMapper miembroMapper;

    @PostMapping("/registrar")
    public ResponseEntity<?> createMember(@Valid @RequestBody MemberModel applicationModel) {
        try {
            log.info("Recibida solicitud de pre registro para miembro: {}", applicationModel.getIdentification());

            //MiembroModel miembro = miembroMapper.toEntity(miembroDto);

            MemberModel miembroRegistrado = miembroService.createMember(applicationModel);

            //MiembroDto miembroRegistradoDto = miembroMapper.toDto(miembroRegistrado);

            log.info("Solicitud creada exitosamente: {}", applicationModel.getIdentification());
            return ResponseEntity.status(HttpStatus.CREATED).body(applicationModel);

        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear la solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error inesperado al crear la solicitud", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }
}
