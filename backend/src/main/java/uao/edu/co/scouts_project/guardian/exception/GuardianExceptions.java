package uao.edu.co.scouts_project.guardian.exception;

public class GuardianExceptions {

    public static class GuardianNotFoundException extends RuntimeException {
        public GuardianNotFoundException(String message) {
            super(message);
        }
    }

    public static class MemberNotFoundException extends RuntimeException {
        public MemberNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidGuardianException extends RuntimeException {
        public InvalidGuardianException(String message) {
            super(message);
        }
    }

    public static class MemberAlreadyAssignedException extends RuntimeException {
        public MemberAlreadyAssignedException(String message) {
            super(message);
        }
    }
}