package uao.edu.co.scouts_project.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    @GetMapping("/test/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "message", "Aplicación funcionando correctamente",
                "timestamp", java.time.Instant.now().toString()
        );
    }
}