package uao.edu.co.scouts_project.finanzas.cuotas.model;

import java.math.BigDecimal;
import java.util.UUID;

public class Cuota {
    private final UUID id;
    private final String nombre;
    private final BigDecimal monto;
    private final String periodicidad;
    private final String tipoCuota;
    private final String fechaLimitePago; // ahora String
    private final String medioPago;
    private final String aplicaA;

    public Cuota(UUID id, String nombre, BigDecimal monto, String periodicidad,
                 String tipoCuota, String fechaLimitePago,
                 String medioPago, String aplicaA) {
        this.id = id;
        this.nombre = nombre;
        this.monto = monto;
        this.periodicidad = periodicidad;
        this.tipoCuota = tipoCuota;
        this.fechaLimitePago = fechaLimitePago;
        this.medioPago = medioPago;
        this.aplicaA = aplicaA;
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }
    public BigDecimal getMonto() { return monto; }
    public String getPeriodicidad() { return periodicidad; }
    public String getTipoCuota() { return tipoCuota; }
    public String getFechaLimitePago() { return fechaLimitePago; }
    public String getMedioPago() { return medioPago; }
    public String getAplicaA() { return aplicaA; }
}
