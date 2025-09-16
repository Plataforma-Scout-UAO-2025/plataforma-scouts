package uao.edu.co.scouts_project.acudientes.service;

import uao.edu.co.scouts_project.acudientes.entity.Acudiente;
import uao.edu.co.scouts_project.acudientes.repository.AcudienteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;


@Service
public class AcudienteService {

    private static final Logger logger = LoggerFactory.getLogger(AcudienteService.class);

    @Autowired
    private AcudienteRepository acudienteRepository;

    public List<Acudiente> findAll() {
        logger.info("Acudientes listados");
        return acudienteRepository.findAll();
    }

    public Acudiente saveAcudiente (Acudiente acudiente) {
        logger.info("Acudiente creado");
        return acudienteRepository.save(acudiente);
    }

    public void deleteAcudiente(Long id) {
        logger.info("Acudiente eliminado");
        acudienteRepository.deleteById(id);
    }

    public Acudiente updateAcudiente(Long id, Acudiente acudiente) {
        Acudiente existingAcudiente = acudienteRepository.findById(id).orElseThrow(() -> new RuntimeException("Acudiente not found"));

        existingAcudiente.setAcudienteName(acudiente.getAcudienteName());
        existingAcudiente.setAcudienteLastname(acudiente.getAcudienteLastname());
        existingAcudiente.setAcudientePhone(acudiente.getAcudientePhone());
        existingAcudiente.setAcudienteParent(acudiente.getAcudienteParent());
        existingAcudiente.setAcudienteEmail(acudiente.getAcudienteEmail());

        logger.info("Acudiente actualizado");

        return acudienteRepository.save(existingAcudiente);
    }
}
