package uao.edu.co.scouts_project.finanzas.cuotas.repository;

import uao.edu.co.scouts_project.finanzas.cuotas.model.Cuota;

import java.util.List;

public interface ICuotaRepository {
    Cuota save(Cuota cuota);
    List<Cuota> findAll();
}
