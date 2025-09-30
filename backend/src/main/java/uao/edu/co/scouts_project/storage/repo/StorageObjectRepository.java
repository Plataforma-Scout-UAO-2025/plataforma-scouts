package uao.edu.co.scouts_project.storage.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uao.edu.co.scouts_project.storage.domain.StorageObject;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StorageObjectRepository extends JpaRepository<StorageObject, UUID> {
    
    // Método para encontrar un objeto por su ruta (name) y el nombre del bucket
    Optional<StorageObject> findByNameAndBucketId(String name, String bucketId);
}