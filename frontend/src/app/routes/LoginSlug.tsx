import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "@/api/axios";

const LoginSlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!slug) {
      navigate("/");
      return;
    }
    axios.get(`/tenants/slug/${slug}`)
      .then((res) => {
        const org_id = res.data.org_id;
        if (org_id) {
          loginWithRedirect({
            authorizationParams: {
              organization: org_id
            }
          });
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          navigate("/");
        } else {
          // Manejar otros errores si es necesario
          navigate("/");
        }
      });
  }, [slug, loginWithRedirect, navigate]);

  return null;
};

export default LoginSlug;

