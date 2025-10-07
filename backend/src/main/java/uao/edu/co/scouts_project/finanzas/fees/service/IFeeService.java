package uao.edu.co.scouts_project.finanzas.fees.service;

import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.IdNameDto;

import java.util.List;

import uao.edu.co.scouts_project.finanzas.fees.dto.CreateCuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;

public interface IFeeService {

  /** Crea Concept + FeePlan (+ Installments) según el scope/periodicidad. */
  CuotaDto create(CreateCuotaDto dto);

  /** Lista todas las cuotas (fee plans) de un tenant */
  
  List<CuotaDto> listFeesByTenant(String tenantId);

  /** Lista todos los subgrupos de un tenant */

  List<IdNameDto> listSubgroupsByTenant(String tenantId);
  
  /** Lista todos las secciones de un tenant */

  List<IdNameDto> listSectionsByTenant(String tenantId);
  
  /** Lista todos los miembros de un tenant */

  List<MemberPaymentDto> listMembersByTenant(String tenantId);

  /** Actualiza parcialmente una cuota. Solo cambios no disruptivos (amount, name, description), solo deberia ser usado *antes* de que se realice ningun pago */
  CuotaDto patch(Long feePlanId, CuotaDto patchDto, String tenantId);

  /** Borra una cuota, sus installments y su concepto. Usar con cuidado */
  void deleteFeePlan(Long feePlanId, String tenantId);
}
