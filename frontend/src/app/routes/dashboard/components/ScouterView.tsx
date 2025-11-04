import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useTenantParams } from "@/app/routes/organigrama/organigramaRamas_Subramas/hooks/useTenantParams";
import { getSections, getSubgroups } from "@/api/organigramaApi";
import { getMembersBySubgroup } from "@/api/organigramaApi";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { Member } from "@/types/member.type";
import { updateMemberAction } from "@/store/members/membersActions";
import type { AppDispatch } from "@/store/store";
import { Pencil, Save, X } from "lucide-react";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import PendingApprovalModal from "@/app/routes/admin-grupal/Miembros/components/PendingApprovalModal";
import InactiveMemberModal from "@/app/routes/admin-grupal/Miembros/components/InactiveMemberModal";

const ScouterView = () => {
  const { hasAccess, reason, loading: accessLoading } = useMemberAccess();
  const { user } = useAuth0();
  const { currentUserRoleLabel } = useRoleContext();
  const displayName = user?.nickname || "";

  // Tenant y grupo actual
  const { tenantId, groupSlug } = useTenantParams();

  // Estado de selección de rama/subrama y miembros
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Cargar ramas del grupo
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!tenantId || !groupSlug) return;
      try {
        const data = await getSections(tenantId, groupSlug);
        if (!active) return;
        setSections(data);
      } catch (e) {
        console.error("Error cargando ramas", e);
        toast.error("No se pudieron cargar las ramas");
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [tenantId, groupSlug]);

  // Cargar subramas al seleccionar rama
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!tenantId || !groupSlug || !selectedSectionId) {
        setSubgroups([]);
        setSelectedSubgroupId("");
        return;
      }
      try {
        const data = await getSubgroups(selectedSectionId, tenantId, groupSlug);
        if (!active) return;
        setSubgroups(data);
      } catch (e) {
        console.error("Error cargando subramas", e);
        toast.error("No se pudieron cargar las subramas");
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [tenantId, groupSlug, selectedSectionId]);

  // Cargar miembros por subrama
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!selectedSubgroupId) {
        setMembers([]);
        return;
      }
      try {
        setLoading(true);
        const data = await getMembersBySubgroup(Number(selectedSubgroupId));
        if (!active) return;
        // Filtrar activos y aprobados, separar solo scouts (excluye SCOUTER)
        const filtered = (data || []).filter(
          (m) => (m.is_active ?? m.isActive) && (m.status === "APPROVED") && (m.role !== "SCOUTER")
        );
        setMembers(filtered);
      } catch (e) {
        console.error("Error cargando miembros", e);
        toast.error("No se pudieron cargar los integrantes");
      } finally {
        setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [selectedSubgroupId]);

  const scouterInfo = useMemo(() => ({
    nombre: displayName,
    grupo: groupSlug || "",
    rama: sections.find(s => String(s.sectionId ?? s.id) === selectedSectionId)?.name || "",
    subrama: subgroups.find(sg => String(sg.subgroupId ?? sg.id) === selectedSubgroupId)?.name || "",
    avancePromedio: 0, // TODO: Integrar API de progresión cuando esté disponible
  }), [displayName, groupSlug, sections, subgroups, selectedSectionId, selectedSubgroupId]);

  const handleSaveMember = async (member: Member, updates: Partial<Member>) => {
    try {
      setSavingId(member.member_id || member.memberId || 0);
      // Solo enviamos campos básicos permitidos actualmente
      const payload = {
        phone: updates.phone,
        address: updates.address,
      };
      // update_member_by_id espera uid string
      await dispatch(
        updateMemberAction({ uid: String(member.member_id || member.memberId || ""), updates: payload })
      );
      toast.success("Integrante actualizado");
    } catch (e) {
      console.error("Error guardando miembro", e);
      toast.error("No se pudo actualizar el integrante");
    } finally {
      setSavingId(null);
    }
  };

  const [editMap, setEditMap] = useState<Record<string | number, Partial<Member>>>({});
  const startEdit = (m: Member) => {
    const key = m.member_id || m.memberId || 0;
    setEditMap((prev) => ({ ...prev, [key]: { phone: m.phone || "", address: m.address || "" } }));
  };
  const cancelEdit = (m: Member) => {
    const key = m.member_id || m.memberId || 0;
    setEditMap((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };
  const commitEdit = async (m: Member) => {
    const key = m.member_id || m.memberId || 0;
    const updates = editMap[key] || {};
    await handleSaveMember(m, updates);
    cancelEdit(m);
  };

  if (accessLoading) {
    return <div className="flex justify-center items-center h-screen">Validando acceso...</div>;
  }

  if (reason === "pending") {
    return <PendingApprovalModal isOpen={true} />;
  }

  if (reason === "inactive") {
    return <InactiveMemberModal isOpen={true} />;
  }

  if (!hasAccess) {
    return <div className="flex justify-center items-center h-screen">No tienes acceso al sistema</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          ¡Bienvenido, {currentUserRoleLabel || "Scouter"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu rama, integrantes y consulta información médica
        </p>
      </div>

      {/* Selección Rama/Subrama + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Tu Información</CardTitle>
            <CardDescription>Datos básicos de tu rol y rama</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li><strong>Nombre:</strong> {scouterInfo.nombre}</li>
              <li><strong>Grupo:</strong> {scouterInfo.grupo}</li>
              <li><strong>Rama:</strong> {scouterInfo.rama || "Seleccione una rama"}</li>
              <li><strong>Subrama:</strong> {scouterInfo.subrama || "Seleccione una subrama"}</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Rama</span>
                <Select value={selectedSectionId} onValueChange={(v) => setSelectedSectionId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una rama" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={String(s.sectionId ?? s.id)} value={String(s.sectionId ?? s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Subrama</span>
                <Select value={selectedSubgroupId} onValueChange={(v) => setSelectedSubgroupId(v)} disabled={!selectedSectionId || subgroups.length === 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={subgroups.length ? "Selecciona una subrama" : "No hay subramas"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subgroups.map((sg) => (
                      <SelectItem key={String(sg.subgroupId ?? sg.id)} value={String(sg.subgroupId ?? sg.id)}>
                        {sg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to="/app/grupos/informacion-medica">Gestionar información médica</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Avance Promedio</CardTitle>
            <CardDescription>Progreso general de tu rama (próximamente)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div className="bg-primary h-4" style={{ width: `${scouterInfo.avancePromedio}%` }} />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              Avance actual: <strong>{scouterInfo.avancePromedio}%</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrantes de la subrama seleccionada */}
      <Card className="border border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Integrantes</CardTitle>
          <CardDescription>
            {selectedSubgroupId ? "Lista de integrantes (solo lectura básica, puedes actualizar datos de contacto)" : "Selecciona una subrama para ver sus integrantes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando integrantes…</div>
          ) : selectedSubgroupId ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const key = m.member_id || m.memberId || 0;
                    const edit = editMap[key];
                    return (
                      <TableRow key={String(key)}>
                        <TableCell>{m.first_name || m.firstName} {m.last_name || m.lastName}</TableCell>
                        <TableCell>{m.identification || "-"}</TableCell>
                        <TableCell>
                          {edit ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={edit.phone || ""}
                              onChange={(e) => setEditMap((prev) => ({ ...prev, [key]: { ...prev[key], phone: e.target.value } }))}
                            />
                          ) : (
                            m.phone || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {edit ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={edit.address || ""}
                              onChange={(e) => setEditMap((prev) => ({ ...prev, [key]: { ...prev[key], address: e.target.value } }))}
                            />
                          ) : (
                            m.address || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {!edit ? (
                            <Button size="sm" variant="outline" onClick={() => startEdit(m)}><Pencil className="w-4 h-4 mr-1" />Editar</Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => commitEdit(m)} disabled={savingId === key}><Save className="w-4 h-4 mr-1" />Guardar</Button>
                              <Button size="sm" variant="secondary" onClick={() => cancelEdit(m)}><X className="w-4 h-4 mr-1" />Cancelar</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No hay integrantes</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Selecciona una subrama para ver sus integrantes</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScouterView;
