package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SectionDTO(
  Long id,
  @NotBlank @Size(max=50) String standardName,
  @Size(max=100) String groupSpecificName,
  String programDescription,
  String sectionLogoUrl,
  String sectionFlagUrl,
  String sectionYell,
  String callMethod
) {}
