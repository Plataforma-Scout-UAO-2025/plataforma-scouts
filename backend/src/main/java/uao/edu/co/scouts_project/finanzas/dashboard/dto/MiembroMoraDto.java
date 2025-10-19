package uao.edu.co.scouts_project.finanzas.dashboard.dto;

import java.math.BigDecimal;

public interface MiembroMoraDto {
  Long getMember_id();
  String getFirst_name();
  String getLast_name();
  String getSubgroup_name();
  BigDecimal getAmount_debt();
}
