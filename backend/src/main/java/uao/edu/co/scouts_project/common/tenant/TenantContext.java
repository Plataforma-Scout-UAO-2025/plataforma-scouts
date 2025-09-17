package uao.edu.co.scouts_project.common.tenant;

public final class TenantContext {
  private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();
  private TenantContext() {}
  public static void setTenantId(String tenantId){ CURRENT.set(tenantId); }
  public static String getTenantId(){ return CURRENT.get(); }
  public static void clear(){ CURRENT.remove(); }
}
