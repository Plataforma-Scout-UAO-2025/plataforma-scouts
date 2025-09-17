package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.common.tenant.TenantContext;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SectionService {
  private final SectionRepository repo;
  public SectionService(SectionRepository repo){ this.repo = repo; }
  private Integer tenant(){ return Integer.parseInt(TenantContext.getTenantId()); }
  public List<Section> list(){ return repo.findAllByTenant(tenant()); }
  public Section get(Long id){
    return repo.findById(id).filter(s -> s.getTenantId().equals(tenant()))
      .orElseThrow(() -> new IllegalArgumentException("Section not found"));
  }
  @Transactional public Section create(SectionDTO dto){
    Section s = new Section(tenant(), dto.standardName(), dto.groupSpecificName());
    s.setProgramDescription(dto.programDescription());
    s.setSectionLogoUrl(dto.sectionLogoUrl());
    s.setSectionFlagUrl(dto.sectionFlagUrl());
    s.setSectionYell(dto.sectionYell());
    s.setCallMethod(dto.callMethod());
    return repo.save(s);
  }
  @Transactional public Section update(Long id, SectionDTO dto){
    Section s = get(id);
    s.setStandardName(dto.standardName());
    s.setGroupSpecificName(dto.groupSpecificName());
    s.setProgramDescription(dto.programDescription());
    s.setSectionLogoUrl(dto.sectionLogoUrl());
    s.setSectionFlagUrl(dto.sectionFlagUrl());
    s.setSectionYell(dto.sectionYell());
    s.setCallMethod(dto.callMethod());
    return repo.save(s);
  }
  @Transactional public void delete(Long id){ repo.delete(get(id)); }
}
