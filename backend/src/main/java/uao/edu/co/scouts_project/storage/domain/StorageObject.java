package uao.edu.co.scouts_project.storage.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import java.util.UUID;

@Entity
@Immutable // La marcamos como inmutable, nuestra app solo la leerá.
@Table(name = "objects", schema = "storage")
public class StorageObject {

    @Id
    private UUID id;

    @Column(name = "name")
    private String name; // Esta es la ruta completa del archivo en el bucket.

    @Column(name = "bucket_id")
    private String bucketId;

    // Getters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getBucketId() { return bucketId; }
}