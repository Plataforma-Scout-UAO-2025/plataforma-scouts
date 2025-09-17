package uao.edu.co.scouts_project.Miembros.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;
import uao.edu.co.scouts_project.Miembros.Repository.IMiembroRepository;


@Slf4j
@Service
@Primary
public class MiembroServiceImp implements IMiembroService {

    @Autowired
    private IMiembroRepository miembroRepository;

    @Override
    public MiembroModel registrarMiembro(MiembroModel miembro) {
        try {
            if (miembroRepository.findById(miembro.getIdentificacion()).isPresent()) {
                throw new Exception("Ya existe un miembro con la identificación " + miembro.getIdentificacion());
            }
            this.miembroRepository.save(miembro);
            log.info(" Miembro preregistrado: {}", miembro);
        } catch (Exception e) {
            log.error("Error inesperado al registrar miembro", e);
        }
        return miembro;
    }

}

