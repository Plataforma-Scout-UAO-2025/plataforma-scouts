package uao.edu.co.scouts_project.finanzas.cuotas.repository.jpa;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cuotas")
public class CuotaEntity {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    private String nombre;

    private BigDecimal monto;

    private String periodicidad;

    @Column(name = "tipo_cuota")
    private String tipoCuota;

    @Column(name = "fecha_limite_pago")
    private String fechaLimitePago; // String en DB

    @Column(name = "medio_pago")
    private String medioPago;

    @Column(name = "aplica_a")
    private String aplicaA;

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public String getPeriodicidad() { return periodicidad; }
    public void setPeriodicidad(String periodicidad) { this.periodicidad = periodicidad; }
    public String getTipoCuota() { return tipoCuota; }
    public void setTipoCuota(String tipoCuota) { this.tipoCuota = tipoCuota; }
    public String getFechaLimitePago() { return fechaLimitePago; }
    public void setFechaLimitePago(String fechaLimitePago) { this.fechaLimitePago = fechaLimitePago; }
    public String getMedioPago() { return medioPago; }
    public void setMedioPago(String medioPago) { this.medioPago = medioPago; }
    public String getAplicaA() { return aplicaA; }
    public void setAplicaA(String aplicaA) { this.aplicaA = aplicaA; }
}
