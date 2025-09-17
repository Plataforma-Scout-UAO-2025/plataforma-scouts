package uao.edu.co.scouts_project.finanzas.cuotas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.service.ICuotasService;

import java.net.URI;
import java.util.List;

@Tag(name = "Finanzas - Cuotas", description = "Gestión de cuotas")
@RestController
@RequestMapping("/api/v1/finanzas/cuotas")
public class CuotasController {

    private final ICuotasService service;

    public CuotasController(ICuotasService service) {
        this.service = service;
    }

    @Operation(summary = "Crear una cuota")
    @PostMapping
    public ResponseEntity<CuotaDTO> crear(@RequestBody CrearCuotaDTO dto) {
        CuotaDTO created = service.crear(dto);
        return ResponseEntity
                .created(URI.create("/api/v1/finanzas/cuotas/" + created.id()))
                .body(created);
    }

    @Operation(summary = "Listar cuotas")
    @GetMapping
    public ResponseEntity<List<CuotaDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }
}
