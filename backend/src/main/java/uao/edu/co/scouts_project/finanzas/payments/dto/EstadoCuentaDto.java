package uao.edu.co.scouts_project.finanzas.payments.dto;

import java.math.BigDecimal;
import java.util.List;

public class EstadoCuentaDto {

    public static class KpisDto {
        private BigDecimal totalPendiente;
        private BigDecimal totalPagado;
        private long cuotasVencidas;

        public KpisDto() {}
        public KpisDto(BigDecimal totalPendiente, BigDecimal totalPagado, long cuotasVencidas) {
            this.totalPendiente = totalPendiente;
            this.totalPagado = totalPagado;
            this.cuotasVencidas = cuotasVencidas;
        }

        public BigDecimal getTotalPendiente() { return totalPendiente; }
        public void setTotalPendiente(BigDecimal totalPendiente) { this.totalPendiente = totalPendiente; }
        public BigDecimal getTotalPagado() { return totalPagado; }
        public void setTotalPagado(BigDecimal totalPagado) { this.totalPagado = totalPagado; }
        public long getCuotasVencidas() { return cuotasVencidas; }
        public void setCuotasVencidas(long cuotasVencidas) { this.cuotasVencidas = cuotasVencidas; }
    }

    private KpisDto kpis;
    private List<CuotasEstadoDto> cuotas;
    // Caso 2 (tesorero): null. Caso 1 (acudiente): [MemberDto] del mismo member.
    private List<MemberDto> members;

    public KpisDto getKpis() { return kpis; }
    public void setKpis(KpisDto kpis) { this.kpis = kpis; }
    public List<CuotasEstadoDto> getCuotas() { return cuotas; }
    public void setCuotas(List<CuotasEstadoDto> cuotas) { this.cuotas = cuotas; }
    public List<MemberDto> getMembers() { return members; }
    public void setMembers(List<MemberDto> members) { this.members = members; }
}
