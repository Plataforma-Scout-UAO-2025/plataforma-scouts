package uao.edu.co.scouts_project.web.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sec")
public class SecurityUtils {

    private final PermissionQueryPort permissionQueryPort;

    public SecurityUtils(PermissionQueryPort permissionQueryPort) {
        this.permissionQueryPort = permissionQueryPort;
    }

    @GetMapping("/roles")
    public List<String> getAuthenticatedUserRoles() {
        return permissionQueryPort.getCurrentUserRoles();
    }

}
