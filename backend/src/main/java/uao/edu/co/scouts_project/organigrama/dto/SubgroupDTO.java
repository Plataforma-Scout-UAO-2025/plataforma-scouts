package uao.edu.co.scouts_project.organigrama.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record SubgroupDTO(
  Long id,
  Long sectionId,
  @NotBlank String subgroupName,
  String subgroupType,
  LocalDate creationDate,
  Boolean active
) {}
