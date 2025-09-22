package uao.edu.co.scouts_project.Members.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.Members.Model.MemberModel;
import uao.edu.co.scouts_project.Members.Repository.IMemberRepository;


@Slf4j
@Service
@Primary
public class MemberServiceImp implements IMemberService {

    @Autowired
    private IMemberRepository miembroRepository;

    @Override
    public MemberModel createMember(MemberModel miembro) {
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

