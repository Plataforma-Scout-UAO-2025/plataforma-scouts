package uao.edu.co.scouts_project.infrastructure.auth0;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

final class ConnectionPayloadUtil {
    private static final Logger log = LoggerFactory.getLogger(ConnectionPayloadUtil.class);

    private static final Set<String> ALLOWED_POLICIES = Set.of("none", "low", "fair", "good", "excellent");

    private ConnectionPayloadUtil() {}

    static String normalizeNameFromSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("slug no puede ser nulo o vacío");
        }
        String s = slug.replace('_', '-');
        return "uep-" + s; // realms = name
    }

    static String normalizePasswordPolicy(String policy) {
        String p = (policy == null || policy.isBlank()) ? "good" : policy.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_POLICIES.contains(p)) {
            log.warn("passwordPolicy '{}' no es válido. Usando 'good' como fallback.", policy);
            return "good";
        }
        return p;
    }

    static List<String> parseEnabledClients(String csv) {
        if (csv == null) return Collections.emptyList();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    static Map<String, Object> buildOptions(String passwordPolicy, boolean disableSignup) {
        Map<String, Object> options = new LinkedHashMap<>();

        // mfa
        Map<String, Object> mfa = new LinkedHashMap<>();
        mfa.put("active", true);
        mfa.put("return_enroll_settings", true);
        options.put("mfa", mfa);

        // attributes
        Map<String, Object> attributes = new LinkedHashMap<>();
        // email
        Map<String, Object> email = new LinkedHashMap<>();
        Map<String, Object> emailSignup = new LinkedHashMap<>();
        emailSignup.put("status", "required");
        Map<String, Object> verification = new LinkedHashMap<>();
        verification.put("active", true);
        emailSignup.put("verification", verification);
        email.put("signup", emailSignup);
        email.put("unique", true);
        Map<String, Object> emailIdentifier = new LinkedHashMap<>();
        emailIdentifier.put("active", true);
        email.put("identifier", emailIdentifier);
        email.put("profile_required", true);
        email.put("verification_method", "link");
        attributes.put("email", email);
        // username
        Map<String, Object> username = new LinkedHashMap<>();
        Map<String, Object> usernameSignup = new LinkedHashMap<>();
        usernameSignup.put("status", "required");
        username.put("signup", usernameSignup);
        Map<String, Object> usernameIdentifier = new LinkedHashMap<>();
        usernameIdentifier.put("active", true);
        username.put("identifier", usernameIdentifier);
        Map<String, Object> validation = new LinkedHashMap<>();
        validation.put("max_length", 15);
        validation.put("min_length", 1);
        Map<String, Object> allowedTypes = new LinkedHashMap<>();
        allowedTypes.put("email", false);
        allowedTypes.put("phone_number", false);
        validation.put("allowed_types", allowedTypes);
        username.put("validation", validation);
        username.put("profile_required", true);
        attributes.put("username", username);
        options.put("attributes", attributes);

        options.put("disable_signup", disableSignup);
        options.put("passwordPolicy", passwordPolicy);

        // passkey_options (future-proof)
        Map<String, Object> passkeyOptions = new LinkedHashMap<>();
        passkeyOptions.put("challenge_ui", "both");
        passkeyOptions.put("local_enrollment_enabled", true);
        passkeyOptions.put("progressive_enrollment_enabled", true);
        options.put("passkey_options", passkeyOptions);

        options.put("strategy_version", 2);

        // authentication_methods
        Map<String, Object> authenticationMethods = new LinkedHashMap<>();
        Map<String, Object> passkey = new LinkedHashMap<>();
        passkey.put("enabled", false);
        Map<String, Object> password = new LinkedHashMap<>();
        password.put("enabled", true);
        authenticationMethods.put("passkey", passkey);
        authenticationMethods.put("password", password);
        options.put("authentication_methods", authenticationMethods);

        options.put("brute_force_protection", true);

        return options;
    }

    static void validateOptions(Map<String, Object> options) {
        // Validación estricta de atributos clave según el modelo
        require(options, "mfa");
        Map<String, Object> mfa = asMap(options.get("mfa"));
        requireValue(mfa, "active", true);

        Map<String, Object> attributes = asMap(require(options, "attributes"));

        Map<String, Object> email = asMap(require(attributes, "email"));
        Map<String, Object> emailSignup = asMap(require(email, "signup"));
        requireValue(emailSignup, "status", "required");
        Map<String, Object> verification = asMap(require(emailSignup, "verification"));
        requireValue(verification, "active", true);
        requireValue(email, "unique", true);
        Map<String, Object> emailIdentifier = asMap(require(email, "identifier"));
        requireValue(emailIdentifier, "active", true);
        requireValue(email, "profile_required", true);
        requireValue(email, "verification_method", "link");

        Map<String, Object> username = asMap(require(attributes, "username"));
        Map<String, Object> usernameSignup = asMap(require(username, "signup"));
        requireValue(usernameSignup, "status", "required");
        Map<String, Object> usernameIdentifier = asMap(require(username, "identifier"));
        requireValue(usernameIdentifier, "active", true);
        Map<String, Object> validation = asMap(require(username, "validation"));
        requireValue(validation, "max_length", 15);
        requireValue(validation, "min_length", 1);
        Map<String, Object> allowed = asMap(require(validation, "allowed_types"));
        requireValue(allowed, "email", false);
        requireValue(allowed, "phone_number", false);
        requireValue(username, "profile_required", true);

        // MFA / Auth methods
        Map<String, Object> authMethods = asMap(require(options, "authentication_methods"));
        Map<String, Object> passkey = asMap(require(authMethods, "passkey"));
        requireValue(passkey, "enabled", false);
        Map<String, Object> password = asMap(require(authMethods, "password"));
        requireValue(password, "enabled", true);

        // Otras claves
        requireValue(options, "strategy_version", 2);
        requireValue(options, "brute_force_protection", true);

        String pp = String.valueOf(require(options, "passwordPolicy"));
        if (!ALLOWED_POLICIES.contains(pp)) {
            throw new IllegalArgumentException("passwordPolicy inválido: " + pp);
        }
    }

    private static Object require(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) throw new IllegalArgumentException("Falta clave obligatoria: " + key);
        return v;
    }

    private static void requireValue(Map<String, Object> map, String key, Object expected) {
        Object v = map.get(key);
        if (!Objects.equals(v, expected)) {
            throw new IllegalArgumentException("Valor inválido para '" + key + "': " + v + " (esperado: " + expected + ")");
        }
    }

    private static Map<String, Object> asMap(Object o) {
        if (o == null) return Collections.emptyMap();
        if (o instanceof Map) return (Map<String, Object>) o;
        throw new IllegalArgumentException("Se esperaba Map para estructura anidada y se recibió: " + o.getClass());
    }
}
