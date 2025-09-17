package uao.edu.co.scouts_project.acudientes.repository;

import uao.edu.co.scouts_project.acudientes.entity.Acudiente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcudienteRepository extends JpaRepository<Acudiente, Long> {
}
