// Java Program to Illustrate Department.java File

// Importing required package modules
package uao.edu.co.scouts_project.acudientes.entity;

// Importing required classes
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="acudientes")

// Class
public class Acudiente {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long acudienteId;
    private String acudienteName;
    private String acudienteLastname;
    private String acudientePhone;
    private String acudienteParent;
    private String acudienteEmail;

}

