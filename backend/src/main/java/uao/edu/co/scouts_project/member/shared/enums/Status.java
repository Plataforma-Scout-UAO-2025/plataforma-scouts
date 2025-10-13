package uao.edu.co.scouts_project.member.shared.enums;

/**
 * Enumeración que define los posibles estados de un miembro dentro del sistema Scouts.
 * <p>
 * Estos valores permiten gestionar el flujo de aprobación del registro
 * de los miembros y controlar su estado actual dentro de la organización.
 */
public enum Status {

    /** Estado que indica que el miembro ha sido aprobado y es parte activa del grupo. */
    APPROVED,

    /** Estado que indica que el miembro se encuentra en revisión o proceso de validación. */
    PENDING,

    /** Estado que indica que la solicitud o registro del miembro fue rechazada. */
    REJECTED
}