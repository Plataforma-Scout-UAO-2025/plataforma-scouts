package uao.edu.co.scouts_project.finanzas.cuotas.repository;

import uao.edu.co.scouts_project.finanzas.cuotas.model.Cuota;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICuotaRepository {
    Cuota save(Cuota cuota);
    List<Cuota> findAll();
    Optional<Cuota> findById(UUID id);
    boolean existsById(UUID id);
    void deleteById(UUID id);
}
