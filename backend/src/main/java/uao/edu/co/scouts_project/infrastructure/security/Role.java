package uao.edu.co.scouts_project.infrastructure.security;

/** Catálogo de roles de la plataforma. */
public enum Role {
  ADMIN_GLOBAL,
  ADMIN_GRUPO,
  COMITE_ADMIN,
  DEV_SUPPORT,
  SCOUT,
  SCOUTER,
  TESORERO,
  ACUDIENTE;

  /**hasRole(...) en Spring Security. */
  public String asAuthority() {
    return "ROLE_" + name();
  }
}
