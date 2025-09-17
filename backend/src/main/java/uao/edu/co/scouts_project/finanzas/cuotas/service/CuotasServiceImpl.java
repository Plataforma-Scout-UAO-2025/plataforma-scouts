package uao.edu.co.scouts_project.finanzas.cuotas.service;

import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.mapper.CuotaMapper;
import uao.edu.co.scouts_project.finanzas.cuotas.repository.ICuotaRepository;

import java.util.List;

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
}
