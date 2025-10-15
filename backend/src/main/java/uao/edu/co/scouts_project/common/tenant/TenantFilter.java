package uao.edu.co.scouts_project.common.tenant;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class TenantFilter implements Filter {
  private final JdbcTemplate jdbc;
  public TenantFilter(JdbcTemplate jdbc){ this.jdbc = jdbc; }
  @Override public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) request;
    String tenantId = req.getHeader("X-Tenant-Id");
    if (tenantId == null || tenantId.isBlank()) tenantId = "0";
    try {
      TenantContext.setTenantId(tenantId);
      jdbc.execute("select set_config('app.tenant_id','" + tenantId + "', true)");
      chain.doFilter(request, response);
    } finally { TenantContext.clear(); }
  }
}
