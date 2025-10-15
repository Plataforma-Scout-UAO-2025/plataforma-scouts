
package uao.edu.co.scouts_project.member;

/**
 * Excepción lanzada cuando se intenta actualizar el estado de un miembro
 * al mismo estado que ya tiene.
 */
public class MemberStatusException extends RuntimeException {
    
    private final Long memberId;
    private final String currentStatus;
    
    public MemberStatusException(Long memberId, String currentStatus) {
        super(String.format("El miembro con ID %d ya tiene el estado %s", memberId, currentStatus));
        this.memberId = memberId;
        this.currentStatus = currentStatus;
    }
    
    public Long getMemberId() {
        return memberId;
    }
    
    public String getCurrentStatus() {
        return currentStatus;
    }
}