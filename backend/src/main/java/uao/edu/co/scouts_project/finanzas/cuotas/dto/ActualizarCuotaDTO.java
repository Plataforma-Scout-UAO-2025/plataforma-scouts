package uao.edu.co.scouts_project.finanzas.cuotas.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload para actualizar una cuota")
public record ActualizarCuotaDTO(
        String nombre,
        String monto,
        String periodicidad,
        String tipoCuota,
        String fechaLimitePago,
        String medioPago,
        String aplicaA
) {}
