package uao.edu.co.scouts_project.auth.repository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mock/scouts")
public class MockScoutsController {

    @GetMapping("/list")
    public String getScoutsList() {
        return "Acceso para usuario autenticado con permiso 'read:scouts-list'.";
    }

    @PostMapping("/add/member")
    public String addScoutMember() {
        return "Acceso para usuario autenticado con permiso 'write:scout-member'.";
    }

    @GetMapping("/member")
    public String getScoutMember() {
        return "Acceso para usuario autenticado con permiso 'read:scout-member'.";
    }
}
