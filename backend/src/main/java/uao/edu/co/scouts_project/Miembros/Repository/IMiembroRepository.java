package uao.edu.co.scouts_project.Miembros.Repository;

import jakarta.validation.constraints.Positive;
import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;

import java.util.List;
import java.util.Optional;

public interface IMiembroRepository extends JpaRepository<MiembroModel, Long> {

    Optional<Object> findById(@Positive Integer idMiembro);

    List<MiembroModel> findByEstado(Estado estado);


}
