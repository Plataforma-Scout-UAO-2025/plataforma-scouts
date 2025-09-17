package uao.edu.co.scouts_project.finanzas.cuotas.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload para crear una cuota")
public record CrearCuotaDTO(
        String nombre,
        String monto,            // viene como string desde FE
        String periodicidad,
        String tipoCuota,
        String fechaLimitePago,  // Numero para que varie con la periodicidad. 
        String medioPago,
        String aplicaA
) {}
