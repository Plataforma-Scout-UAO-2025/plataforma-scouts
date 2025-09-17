package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.service.SectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/organigrama/sections")
public class SectionController {
  private final SectionService service;
  public SectionController(SectionService service){ this.service = service; }

  @GetMapping public List<Section> list(){ return service.list(); }
  @GetMapping("/{id}") public Section get(@PathVariable Long id){ return service.get(id); }

  @PostMapping
  public ResponseEntity<Section> create(@Valid @RequestBody SectionDTO dto){
    Section saved = service.create(dto);
    return ResponseEntity.created(URI.create("/api/organigrama/sections/"+saved.getId())).body(saved);
  }

  @PutMapping("/{id}") public Section update(@PathVariable Long id, @Valid @RequestBody SectionDTO dto){
    return service.update(id, dto);
  }

  @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
