package uao.edu.co.scouts_project.infrastructure.cache;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementación simple en memoria con TTL global por entrada.
 * Minimiza acoplamiento para poder sustituirse fácilmente.
 */
@Component
public class InMemoryPermissionCache implements PermissionCache {

    private static final class Entry {
        final Set<String> permissions;
        final long expiresAt;
        Entry(Set<String> permissions, long expiresAt) {
            this.permissions = permissions;
            this.expiresAt = expiresAt;
        }
    }

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();
    private final long ttlMillis;

    public InMemoryPermissionCache(@Value("${authz.cache.ttl-millis:300000}") long ttlMillis) {
        this.ttlMillis = ttlMillis;
    }

    @Override
    public Optional<Set<String>> getIfValid(String userId) {
        Entry e = store.get(userId);
        long now = System.currentTimeMillis();
        if (e == null) return Optional.empty();
        if (e.expiresAt <= now) {
            store.remove(userId);
            return Optional.empty();
        }
        return Optional.of(e.permissions);
    }

    @Override
    public void put(String userId, Set<String> permissions) {
        store.put(userId, new Entry(permissions, System.currentTimeMillis() + ttlMillis));
    }

    @Override
    public void evict(String userId) {
        store.remove(userId);
    }
}

