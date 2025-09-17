package uao.edu.co.scouts_project.Miembros.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;

public interface IMiembroRepository extends JpaRepository<MiembroModel, Long> {
}
