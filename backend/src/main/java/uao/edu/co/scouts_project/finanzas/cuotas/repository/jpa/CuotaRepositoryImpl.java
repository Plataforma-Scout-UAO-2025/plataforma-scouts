package uao.edu.co.scouts_project.finanzas.cuotas.repository.jpa;

import org.springframework.stereotype.Repository;
import uao.edu.co.scouts_project.finanzas.cuotas.mapper.CuotaMapper;
import uao.edu.co.scouts_project.finanzas.cuotas.model.Cuota;
import uao.edu.co.scouts_project.finanzas.cuotas.repository.ICuotaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class CuotaRepositoryImpl implements ICuotaRepository {

    private final SpringDataCuotaJpaRepository jpa;
    private final CuotaMapper mapper;

    public CuotaRepositoryImpl(SpringDataCuotaJpaRepository jpa, CuotaMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Cuota save(Cuota cuota) {
        var saved = jpa.save(mapper.toEntity(cuota));
        return mapper.toDomain(saved);
    }

    @Override
    public List<Cuota> findAll() {
        return jpa.findAll().stream().map(mapper::toDomain).toList();
    }

        @Override
    public Optional<Cuota> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

        @Override
    public boolean existsById(UUID id) {
        return jpa.existsById(id);
    }

        @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }
}
