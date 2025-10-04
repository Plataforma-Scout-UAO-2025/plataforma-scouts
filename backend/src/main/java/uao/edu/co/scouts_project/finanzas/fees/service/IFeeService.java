package uao.edu.co.scouts_project.finanzas.fees.service;

import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.FeeIndexResponse;

public interface IFeeService {

  /** Crea Concept + FeePlan (+ Installments) según el scope/periodicidad. */
  CuotaDto create(CreateCuotaDto dto);

  /** 
   * Lista todas las cuotas (fee plans) y el catálogo de miembros enriquecido
   * (member, subgroup, section) para el tenant indicado.
   */
  FeeIndexResponse listAllByTenant(Long tenantId);

  /** Actualiza parcialmente una cuota. Solo cambios no disruptivos, solo deberia ser usado *antes* de que se realice ningun pago */
  CuotaDto patch(Long feePlanId, CuotaDto patchDto, Long tenantId);

  /** Borra una cuota, sus installments y su concepto. Usar con cuidado */
  void deleteFeePlan(Long feePlanId, Long tenantId);
}
