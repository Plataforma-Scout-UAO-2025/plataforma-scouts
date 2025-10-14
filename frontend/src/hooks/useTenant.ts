import { useNavigate } from "react-router-dom";

// Hook para obtener el tenant ID
export const useTenant = () => {
  const navigate = useNavigate();
  // Obtener el tenantt ID de la cookie con titulo auth0.E1fqntn0ryTTylXazK30a5EpJjzmIg7f.organization_hint
  const cookieRow = document.cookie
    .split("; ")
    .find((row) =>
      row.startsWith(
        "auth0.E1fqntn0ryTTylXazK30a5EpJjzmIg7f.organization_hint="
      )
    );
  const tenantId = cookieRow?.split("=")[1];

  // Si existe el tenantId, decodificarlo y retornar el tenantId limpio
  if (tenantId) {
    // Decodificar los caracteres URL
    const decoded = decodeURIComponent(tenantId); // -> '"org_6B3k4dao2Wf6eGxa"'
    
    // Quitar las comillas dobles
    const cleanTenantId = decoded.replace(/^"|"$/g, ""); // -> org_6B3k4dao2Wf6eGxa
    console.log("cleanTenantId", cleanTenantId);
    return cleanTenantId;
  }

  // Si no existe el tenantId, redirigir al login
  navigate("/");
};
