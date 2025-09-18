package uao.edu.co.scouts_project.organigrama.api;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/organigrama/subgroups")
public class SubgroupController {
  private final SubgroupService service;
  public SubgroupController(SubgroupService service){ this.service = service; }

  @GetMapping("/by-section/{sectionId}") public List<SubgroupDTO> list(@PathVariable Long sectionId){
    return service.listBySection(sectionId);
  }

  @PutMapping("/{id}")
  public ResponseEntity<SubgroupDTO> update(@PathVariable Long id, @Valid @RequestBody SubgroupDTO dto){
    SubgroupDTO updated = service.update(id, dto);
    return ResponseEntity.ok(updated);
  }

  @PostMapping
  public ResponseEntity<SubgroupDTO> create(@Valid @RequestBody SubgroupDTO dto){
    SubgroupDTO saved = service.create(dto);
    return ResponseEntity.created(URI.create("/api/organigrama/subgroups/"+saved.id())).body(saved);
  }

  @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
