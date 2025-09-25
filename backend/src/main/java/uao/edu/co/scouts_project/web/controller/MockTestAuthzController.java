package uao.edu.co.scouts_project.web.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import static java.lang.String.format;

@RestController
@RequestMapping("/api/v1/mock/scouts")
@CrossOrigin(origins = "*")
public class MockTestAuthzController {

    @GetMapping("/list")
    public String getScoutsList() {

        String name = getCurrentUsername();

        return format("Access for authenticated user with permission 'read:scouts-list', for user %s", name);
    }

    @PostMapping("/add/member")
    public String addScoutMember() {

        String name = getCurrentUsername();

        return format("Access for authenticated user with permission 'write:scout-member', for user %s", name);
    }

    @GetMapping("/member")
    public String getScoutMember() {

        String name = getCurrentUsername();

        return format("Access for authenticated user with permission 'read:scout-member', for user %s", name);
    }

    static String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

}
