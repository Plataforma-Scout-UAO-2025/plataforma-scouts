package uao.edu.co.scouts_project.acudientes.controller;

import uao.edu.co.scouts_project.acudientes.entity.Acudiente;
import uao.edu.co.scouts_project.acudientes.service.AcudienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/acudiente")

public class AcudienteController {

    @Autowired
    private AcudienteService acudienteService;

    @GetMapping("/")
    public ResponseEntity<List<Acudiente>> findAllAcudiente() {
        return ResponseEntity.ok(acudienteService.findAll());
    }

    @PostMapping("/")
    public ResponseEntity<Acudiente> saveAcudiente(@RequestBody Acudiente acudiente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acudienteService.saveAcudiente(acudiente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Acudiente> updateAcudiente(@PathVariable Long id, @RequestBody Acudiente acudiente) {
        return ResponseEntity.ok(acudienteService.updateAcudiente(id, acudiente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcudiente(@PathVariable Long id) {
        acudienteService.deleteAcudiente(id);
        return ResponseEntity.noContent().build();
    }

}
