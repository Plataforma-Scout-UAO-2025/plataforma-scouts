package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.ConnectionFilter;
import com.auth0.exception.APIException;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.Connection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.domain.port.ConnectionQueryPort;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Servicio para crear o actualizar (upsert) conexiones de base de datos en Auth0 (strategy = "auth0").
 * - name = realms[0] = "uep-" + slug.toLowerCase()
 * - strategy_version = 2 (obligatoria)
 * - attributes email/username fijos según modelo provisto
 * - enabled_clients: parseo desde CSV (trim, dedup, filtra vacíos); debe quedar no vacía
 * - idempotente: agrega clientes faltantes, y permite actualizar disable_signup y passwordPolicy
 * - dry-run: valida y loguea sin efectuar llamadas a Auth0 cuando está activo
 */
@Service
public class Auth0ConnectionAdapter implements ConnectionQueryPort {
    private static final Logger log = LoggerFactory.getLogger(Auth0ConnectionAdapter.class);

    private final Auth0ManagementClientProvider managementProvider;

    // Config
    @Value("${auth0.connections.password-policy:good}")
    private String passwordPolicy;

    @Value("${auth0.connections.enabled-clients:}")
    private String enabledClientsCsv;

    @Value("${auth0.connections.disable-signup:false}")
    private boolean disableSignup;

    @Value("${auth0.connections.dry-run:true}")
    private boolean dryRun;

    // Lock por nombre de conexión para evitar carreras
    private static final ConcurrentHashMap<String, ReentrantLock> LOCKS = new ConcurrentHashMap<>();

    public Auth0ConnectionAdapter(Auth0ManagementClientProvider managementProvider) {
        this.managementProvider = managementProvider;
    }

    public String createOrUpdateAuth0DbConnection(String slug) {
        // Normalización de nombre
        final String name = ConnectionPayloadUtil.normalizeNameFromSlug(slug);

        // Parseo y normalización de configuración
        final String normalizedPolicy = ConnectionPayloadUtil.normalizePasswordPolicy(passwordPolicy);
        final List<String> enabledClients = ConnectionPayloadUtil.parseEnabledClients(enabledClientsCsv);
        if (enabledClients.isEmpty()) {
            throw new IllegalArgumentException("enabled_clients no puede ser vacío tras el parseo");
        }

        // Construir options y validarlas estrictamente (dry-run y creación)
        final Map<String, Object> options = ConnectionPayloadUtil.buildOptions(normalizedPolicy, disableSignup);
        ConnectionPayloadUtil.validateOptions(options);

        String topClients = enabledClients.stream().limit(2).toList().toString();
        log.info("[Auth0-Conn] Preparando {} conexión: name={}, realms=[{}], strategy_version=2, disable_signup={}, passwordPolicy={}, enabled_clients_count={} top2={} (dryRun={})",
                "upsert", name, name, disableSignup, normalizedPolicy, enabledClients.size(), topClients, dryRun);
        log.debug("[Auth0-Conn] Payload options={} enabled_clients={}", options, enabledClients);

        // Dry-run
        if (dryRun) {
            log.info("[Auth0-Conn] Dry-run activo: no se realizará creación/actualización en Auth0. Retornando name como pseudo-id: {}", name);
            return name; // pseudo-id para trazabilidad en dry-run
        }

        // Lock por nombre para evitar condiciones de carrera
        ReentrantLock lock = LOCKS.computeIfAbsent(name, k -> new ReentrantLock());
        lock.lock();
        try {
            ManagementAPI api = managementProvider.getManagementAPI();

            // Buscar conexión existente por nombre
            Connection existing = findConnectionByNameWithRetry(api, name);
            if (existing != null) {
                // Validar strategy y strategy_version
                if (!"auth0".equalsIgnoreCase(existing.getStrategy())) {
                    throw new IllegalStateException("Existe una conexión con el mismo name pero strategy != auth0");
                }
                // si no expone strategy_version o si no viene, asumimos no compatible
                Integer sv = null;
                if (existing.getOptions() != null) {
                    Object svObj = asMap(existing.getOptions()).get("strategy_version");
                    if (svObj instanceof Number) {
                        sv = ((Number) svObj).intValue();
                    }
                }
                if (sv == null || sv != 2) {
                    throw new IllegalStateException("La conexión existente no tiene strategy_version=2");
                }

                // Calcular deltas permitidos: enabled_clients (unión), disable_signup y passwordPolicy
                List<String> currentClients = Optional.ofNullable(existing.getEnabledClients()).map(ArrayList::new).orElse(new ArrayList<>());
                Set<String> merged = new LinkedHashSet<>(currentClients);
                merged.addAll(enabledClients);

                boolean changed = false;

                // Preparar objeto de actualización
                Connection update = new Connection();

                if (!merged.equals(new LinkedHashSet<>(currentClients))) {
                    update.setEnabledClients(new ArrayList<>(merged));
                    changed = true;
                }

                Map<String, Object> existingOptions = asMap(existing.getOptions());
                Map<String, Object> newOptions = new HashMap<>(existingOptions);

                Object existingDisable = existingOptions.get("disable_signup");
                if (!Objects.equals(existingDisable, disableSignup)) {
                    newOptions.put("disable_signup", disableSignup);
                    changed = true;
                }
                Object existingPolicy = existingOptions.get("passwordPolicy");
                if (!Objects.equals(existingPolicy, normalizedPolicy)) {
                    newOptions.put("passwordPolicy", normalizedPolicy);
                    changed = true;
                }

                if (!changed) {
                    log.info("[Auth0-Conn] No hay cambios para la conexión existente: {} (id={})", name, existing.getId());
                    return existing.getId();
                }

                update.setOptions(newOptions);

                try {
                    Connection updated = executeWithRetry(() -> api.connections().update(existing.getId(), update).execute(),
                            "update connection");
                    String id = updated.getId() != null ? updated.getId() : existing.getId();
                    log.info("[Auth0-Conn] Conexión actualizada: name={}, id={}", name, id);
                    log.debug("[Auth0-Conn] Update payload options={} enabled_clients={}", newOptions, merged);
                    return id;
                } catch (APIException e) {
                    log.error("[Auth0-Conn] Error API actualizando conexión {}: {} {}", name, e.getStatusCode(), e.getMessage());
                    throw e;
                }
            }

            // No existe: crear
            Connection create = new Connection(name, "auth0");
            create.setOptions(options);
            create.setEnabledClients(new ArrayList<>(enabledClients));
            create.setRealms(java.util.List.of(name));

            try {
                Connection created = executeWithRetry(() -> api.connections().create(create).execute(),
                        "create connection");
                String id = created.getId();
                log.info("[Auth0-Conn] Conexión creada: name={}, id={}", name, id);
                log.debug("[Auth0-Conn] Create payload options={} enabled_clients={}", options, enabledClients);
                return id;
            } catch (APIException e) {
                if (e.getStatusCode() == 409) {
                    // Posible creación concurrente: intentar recuperar y devolver id
                    try {
                        Connection concurrent = findConnectionByNameWithRetry(api, name);
                        if (concurrent != null && "auth0".equalsIgnoreCase(concurrent.getStrategy())) {
                            log.warn("[Auth0-Conn] 409 al crear pero la conexión ya existe. Retornando id existente: {}", concurrent.getId());
                            return concurrent.getId();
                        }
                    } catch (Auth0Exception ignored) {
                        // Seguimos con el error original
                    }
                }
                log.error("[Auth0-Conn] Error API creando conexión {}: {} {}", name, e.getStatusCode(), e.getMessage());
                throw e;
            }
        } catch (Auth0Exception e) {
            throw new RuntimeException("Fallo comunicando con Auth0 Management API: " + e.getMessage(), e);
        } finally {
            lock.unlock();
        }
    }

    private Map<String, Object> asMap(Object options) {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (options instanceof Map) ? (Map<String, Object>) options : Collections.emptyMap();
        return result;
    }

    private Connection findConnectionByName(ManagementAPI api, String name) throws Auth0Exception {
        // Filtro por name y strategy para minimizar resultados
        ConnectionFilter filter = new ConnectionFilter().withName(name).withStrategy("auth0");
        List<Connection> items = api.connections().list(filter).execute();
        if (items == null || items.isEmpty()) {
            return null;
        }
        for (Connection c : items) {
            if (name.equalsIgnoreCase(c.getName())) {
                return c;
            }
        }
        return null;
    }

    // Variante con reintentos para la búsqueda
    private Connection findConnectionByNameWithRetry(ManagementAPI api, String name) throws Auth0Exception {
        return executeWithRetry(() -> findConnectionByName(api, name), "list connections");
    }

    // Reintentos 429/5xx con backoff exponencial simple (2 reintentos adicionales)
    private <T> T executeWithRetry(SupplierWithAuth0<T> supplier, String opDesc) throws Auth0Exception {
        int attempts = 0;
        long backoff = 250L;
        while (true) {
            attempts++;
            try {
                return supplier.get();
            } catch (APIException e) {
                int status = e.getStatusCode();
                boolean retryable = status == 429 || (status >= 500 && status < 600);
                if (retryable && attempts <= 3) {
                    log.warn("[Auth0-Conn] {} recibió {}. Reintentando {}/3 en {} ms", opDesc, status, attempts, backoff);
                    try { Thread.sleep(backoff); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    backoff *= 2;
                    continue;
                }
                throw e;
            }
        }
    }

    @FunctionalInterface
    private interface SupplierWithAuth0<T> {
        T get() throws Auth0Exception;
    }
}
