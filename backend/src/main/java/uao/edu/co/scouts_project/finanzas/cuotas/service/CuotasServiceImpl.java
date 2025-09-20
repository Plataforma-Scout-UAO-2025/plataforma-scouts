package uao.edu.co.scouts_project.finanzas.cuotas.service;

import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.ActualizarCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.exception.CuotaNotFoundException;
import uao.edu.co.scouts_project.finanzas.cuotas.mapper.CuotaMapper;
import uao.edu.co.scouts_project.finanzas.cuotas.model.Cuota;
import uao.edu.co.scouts_project.finanzas.cuotas.repository.ICuotaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CuotasServiceImpl implements ICuotasService {

    private final ICuotaRepository repo;
    private final CuotaMapper mapper;

    public CuotasServiceImpl(ICuotaRepository repo, CuotaMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Override
    public CuotaDTO crear(CrearCuotaDTO dto) {
        var saved = repo.save(mapper.toDomain(dto));
        return mapper.toDto(saved);
    }

    @Override
    public List<CuotaDTO> listar() {
        return repo.findAll().stream().map(mapper::toDto).toList();
    }

    @Override
    public CuotaDTO actualizar(UUID id, ActualizarCuotaDTO dto) {
        // 404 si no existe
        var existente = repo.findById(id).orElseThrow(() -> new CuotaNotFoundException(id));

        // construir un dominio “reemplazado” (PUT = reemplazo completo)
        Cuota reemplazada = new Cuota(
                id,
                dto.nombre(),
                new BigDecimal(dto.monto()),
                dto.periodicidad(),
                dto.tipoCuota(),
                dto.fechaLimitePago(),
                dto.medioPago(),
                dto.aplicaA()
        );

        var guardada = repo.save(reemplazada);
        return mapper.toDto(guardada);
    }

    @Override
    public void eliminar(UUID id) {
        if (!repo.existsById(id)) {
            throw new CuotaNotFoundException(id);
        }
        repo.deleteById(id);
    }
}
