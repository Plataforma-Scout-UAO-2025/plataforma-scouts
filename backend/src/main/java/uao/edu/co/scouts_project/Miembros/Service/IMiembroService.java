package uao.edu.co.scouts_project.Miembros.Service;

import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;

import java.util.List;
import java.util.Optional;

public interface IMiembroService {

    MiembroModel crearMiembro(MiembroModel member);

    List<MiembroModel> listarMiembros();

    Optional<MiembroModel> obtenerMiembroPorId(Long id);

    Boolean actualizarEstado(Long idMiembro, Estado estado);

    Optional<MiembroModel> actualizarMiembro(Long idMiembro, MiembroModel miembroUpdateDto);

    List<MiembroModel> listarMiembrosPorEstado(Estado estado);


}


