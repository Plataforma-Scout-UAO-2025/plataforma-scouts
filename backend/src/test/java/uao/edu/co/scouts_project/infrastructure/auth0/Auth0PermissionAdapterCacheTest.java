package uao.edu.co.scouts_project.infrastructure.auth0;

import uao.edu.co.scouts_project.domain.service.PermissionNormalizer;
import uao.edu.co.scouts_project.infrastructure.cache.InMemoryPermissionCache;
import uao.edu.co.scouts_project.infrastructure.cache.PermissionCacheMetrics;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Test unitario aislado del caché: se simula fetch remoto sobreescribiendo el método.
 */
class Auth0PermissionAdapterCacheTest {

    private static class StubAdapter extends Auth0PermissionAdapter {
        private int remoteCalls = 0;
        StubAdapter(InMemoryPermissionCache cache, PermissionCacheMetrics metrics, PermissionNormalizer normalizer) {
            super(null, metrics, normalizer, cache); // managementProvider es null porque fetchFromRemote está sobreescrito
        }
        @Override
        protected Set<String> fetchFromRemote(String userId) {
            remoteCalls++;
            return Set.of("read:alpha", "ROLE_ADMIN");
        }
    }

    @Test
    void cacheHitPreventsSecondRemoteCall() {
        InMemoryPermissionCache cache = new InMemoryPermissionCache(300000); // 5 min TTL
        PermissionCacheMetrics metrics = new PermissionCacheMetrics();
        PermissionNormalizer normalizer = new PermissionNormalizer();
        StubAdapter adapter = new StubAdapter(cache, metrics, normalizer);

        Set<String> first = adapter.getUserPermissions("u1");
        Set<String> second = adapter.getUserPermissions("u1");

        assertEquals(first, second);
        assertEquals(1, adapter.remoteCalls, "Solo una llamada remota esperada");
        assertEquals(1, metrics.getMisses(), "Primera llamada debe ser miss");
        assertEquals(1, metrics.getHits(), "Segunda llamada debe ser hit");
    }
}
