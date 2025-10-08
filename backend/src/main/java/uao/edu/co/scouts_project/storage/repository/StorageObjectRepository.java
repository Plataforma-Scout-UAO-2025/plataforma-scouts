package uao.edu.co.scouts_project.storage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uao.edu.co.scouts_project.storage.domain.StorageObject;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.Set;


@Repository
public interface StorageObjectRepository extends JpaRepository<StorageObject, UUID> {
    
    Optional<StorageObject> findByNameAndBucketId(String name, String bucketId);

    List<StorageObject> findByIdIn(Set<UUID> ids);
}