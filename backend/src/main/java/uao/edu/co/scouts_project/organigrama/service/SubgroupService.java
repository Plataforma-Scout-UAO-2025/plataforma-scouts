package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.common.tenant.TenantContext;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.domain.Subgroup;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.SubgroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubgroupService {
  private final SubgroupRepository repo;
  private final SectionRepository sections;
  public SubgroupService(SubgroupRepository repo, SectionRepository sections){ this.repo=repo; this.sections=sections; }
  private Integer tenant(){ return Integer.parseInt(TenantContext.getTenantId()); }

  @Transactional(readOnly = true)
  public List<SubgroupDTO> listBySection(Long sectionId){
    return repo.findByTenantAndSection(tenant(), sectionId)
      .stream()
      .map(this::toDTO)
      .collect(Collectors.toList());
  }

  @Transactional
  public SubgroupDTO create(SubgroupDTO dto){
    Section section = sections.findById(dto.sectionId())
      .orElseThrow(() -> new IllegalArgumentException("Section not found"));
    if (!section.getTenantId().equals(tenant())) throw new IllegalArgumentException("Section not in tenant");
    Subgroup g = new Subgroup();
    g.setTenantId(tenant()); g.setSection(section);
    g.setSubgroupName(dto.subgroupName()); g.setSubgroupType(dto.subgroupType());
    g.setCreationDate(dto.creationDate()); g.setActive(dto.active()==null?Boolean.TRUE:dto.active());
    Subgroup saved = repo.save(g);
    return toDTO(saved);
  }

  @Transactional
  public void delete(Long id){
    Subgroup g = repo.findById(id).filter(s -> s.getTenantId().equals(tenant()))
      .orElseThrow(() -> new IllegalArgumentException("Subgroup not found"));
    repo.delete(g);
  }

  private SubgroupDTO toDTO(Subgroup g){
    Long sectionId = g.getSection() != null ? g.getSection().getId() : null;
    return new SubgroupDTO(
      g.getId(),
      sectionId,
      g.getSubgroupName(),
      g.getSubgroupType(),
      g.getCreationDate(),
      g.getActive()
    );
  }
}
