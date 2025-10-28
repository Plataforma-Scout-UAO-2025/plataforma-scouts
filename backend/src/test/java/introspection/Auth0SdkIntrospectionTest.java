package introspection;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;

public class Auth0SdkIntrospectionTest {

    @Test
    void listOrganizationsEntityMethods() throws Exception {
        Class<?> cls = Class.forName("com.auth0.client.mgmt.OrganizationsEntity");
        System.out.println("OrganizationsEntity methods:");
        Arrays.stream(cls.getMethods())
                .map(Method::toString)
                .sorted()
                .forEach(System.out::println);
    }

    @Test
    void listEnabledConnectionMethods() throws Exception {
        Class<?> cls = Class.forName("com.auth0.json.mgmt.organizations.EnabledConnection");
        System.out.println("EnabledConnection methods:");
        Arrays.stream(cls.getMethods())
                .map(Method::toString)
                .sorted()
                .forEach(System.out::println);
    }
}

