package uao.edu.co.scouts_project.multitenancy;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;

@Configuration
public class TxConfig {

    private final DataSource dataSource;

    public TxConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf) {
            @Override
            protected void doBegin(Object transaction, TransactionDefinition definition) {
                super.doBegin(transaction, definition);

                // Solo en contexto web (hay JWT -> TenantContext poblado)
                RequestAttributes ra = RequestContextHolder.getRequestAttributes();
                if (ra == null) return;

                final String tenant = TenantContext.get();
                if (tenant == null || tenant.isBlank()) return;

                Connection conn = DataSourceUtils.getConnection(dataSource);
                try {
                    try (PreparedStatement ps = conn.prepareStatement(
                            "SELECT set_config('app.tenant_id', ?, true)"
                    )) {
                        ps.setString(1, tenant);
                        ps.execute();
                    }
                    try (PreparedStatement ps2 = conn.prepareStatement(
                            "SET LOCAL application_name = 'scouts-backend'"
                    )) {
                        ps2.execute();
                    }
                } catch (Exception e) {
                    throw new IllegalStateException("No se pudo establecer app.tenant_id en la conexión", e);
                } finally {
                    // IMPORTANTE: liberar vía DataSourceUtils (no cerrar físicamente)
                    DataSourceUtils.releaseConnection(conn, dataSource);
                }
            }
        };
    }
}