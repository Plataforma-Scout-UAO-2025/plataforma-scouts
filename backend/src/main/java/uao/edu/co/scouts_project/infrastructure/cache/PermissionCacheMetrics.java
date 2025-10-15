package uao.edu.co.scouts_project.infrastructure.cache;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class PermissionCacheMetrics {
    private final AtomicLong hits = new AtomicLong();
    private final AtomicLong misses = new AtomicLong();
    private final AtomicLong refreshes = new AtomicLong();

    public void incrementHits() { hits.incrementAndGet(); }
    public void incrementMisses() { misses.incrementAndGet(); }
    public void incrementRefreshes() { refreshes.incrementAndGet(); }

    public long getHits() { return hits.get(); }
    public long getMisses() { return misses.get(); }
    public long getRefreshes() { return refreshes.get(); }

    public double getHitRatio() {
        long h = hits.get();
        long m = misses.get();
        long total = h + m;
        if (total == 0) return 0.0d;
        return (double) h / (double) total;
    }

    @Override
    public String toString() {
        return "PermissionCacheMetrics{" +
                "hits=" + hits.get() +
                ", misses=" + misses.get() +
                ", refreshes=" + refreshes.get() +
                ", hitRatio=" + String.format("%.4f", getHitRatio()) +
                '}';
    }
}

