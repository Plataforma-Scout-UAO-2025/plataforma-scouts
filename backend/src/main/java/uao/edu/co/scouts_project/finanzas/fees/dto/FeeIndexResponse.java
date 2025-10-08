package uao.edu.co.scouts_project.finanzas.fees.dto;

import java.util.List;

public record FeeIndexResponse(
  List<CuotaDto> items,
  List<MemberPaymentDto> members
) {}
