package uao.edu.co.scouts_project.finanzas.cuotas.repository.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SpringDataCuotaJpaRepository extends JpaRepository<CuotaEntity, UUID> {}
