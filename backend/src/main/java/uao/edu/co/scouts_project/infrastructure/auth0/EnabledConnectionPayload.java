package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.json.mgmt.organizations.EnabledConnection;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Extensión de EnabledConnection que agrega campos no expuestos por el SDK actual,
 * pero soportados por el Management API de Auth0 para enabled_connections.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EnabledConnectionPayload extends EnabledConnection {

    @JsonProperty("is_signup_enabled")
    private Boolean isSignupEnabled;

    @JsonProperty("show_as_button")
    private Boolean showAsButton;

    public EnabledConnectionPayload() {
        super();
    }

    public EnabledConnectionPayload(String connectionId) {
        super(connectionId);
    }

    public Boolean getIsSignupEnabled() {
        return isSignupEnabled;
    }

    public void setIsSignupEnabled(Boolean isSignupEnabled) {
        this.isSignupEnabled = isSignupEnabled;
    }

    public Boolean getShowAsButton() {
        return showAsButton;
    }

    public void setShowAsButton(Boolean showAsButton) {
        this.showAsButton = showAsButton;
    }
}

