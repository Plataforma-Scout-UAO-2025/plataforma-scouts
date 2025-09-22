package uao.edu.co.scouts_project.finanzas.cuotas.mapper;

import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.model.Cuota;
import uao.edu.co.scouts_project.finanzas.cuotas.repository.jpa.CuotaEntity;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class CuotaMapper {

    public Cuota toDomain(CrearCuotaDTO dto) {
        return new Cuota(
                UUID.randomUUID(),
                dto.nombre(),
                new BigDecimal(dto.monto()),
                dto.periodicidad(),
                dto.tipoCuota(),
                dto.fechaLimitePago(), 
                dto.medioPago(),
                dto.aplicaA()
        );
    }

    public CuotaDTO toDto(Cuota c) {
        return new CuotaDTO(
                c.getId().toString(),
                c.getNombre(),
                c.getMonto().toPlainString(),
                c.getPeriodicidad(),
                c.getTipoCuota(),
                c.getFechaLimitePago(), 
                c.getMedioPago(),
                c.getAplicaA()
        );
    }

    public CuotaEntity toEntity(Cuota c) {
        var e = new CuotaEntity();
        e.setId(c.getId());
        e.setNombre(c.getNombre());
        e.setMonto(c.getMonto());
        e.setPeriodicidad(c.getPeriodicidad());
        e.setTipoCuota(c.getTipoCuota());
        e.setFechaLimitePago(c.getFechaLimitePago()); 
        e.setMedioPago(c.getMedioPago());
        e.setAplicaA(c.getAplicaA());
        return e;
    }

    public Cuota toDomain(CuotaEntity e) {
        return new Cuota(
                e.getId(),
                e.getNombre(),
                e.getMonto(),
                e.getPeriodicidad(),
                e.getTipoCuota(),
                e.getFechaLimitePago(), // string
                e.getMedioPago(),
                e.getAplicaA()
        );
    }
}
