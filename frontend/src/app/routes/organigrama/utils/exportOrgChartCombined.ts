import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";

type BranchLite = { id: string | number; name: string; description?: string; minAge?: number; maxAge?: number; status?: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

type SimpleBranches = Array<{ section: BranchLite; subgroups: SubgroupLite[] }>;

function download(filename: string, content: string, type = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\uFEFF" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportBranchesCSV(branches: SimpleBranches) {
  // Encabezados igual que la vista Ramas/Subramas
  const header = [
    "Rama",
    "Descripción",
    "TipoSubrama",
    "NombreSubrama",
    "Estado",
    "Integrantes",
    "JefeRama",
  ];
  const rows: string[][] = [];

  branches.forEach(({ section, subgroups }) => {
    // Derivar Jefe de Rama a partir de líderes únicos de subramas (si no hay campo específico)
    const uniqueLeaders = Array.from(
      new Set((subgroups || []).map((sg) => sg.leader).filter(Boolean) as string[])
    );
    const jefeRama = uniqueLeaders.join(", ");
    const desc = (section.description && String(section.description).trim())
      ? String(section.description)
      : (typeof section.minAge === 'number' && typeof section.maxAge === 'number' && section.minAge > 0 && section.maxAge > 0
          ? `${section.minAge}-${section.maxAge} años`
          : '—');
    const estadoRama = section.status === 'active' ? 'activa' : section.status === 'inactive' ? 'inactiva' : (section.status || '—');

    if (!subgroups || subgroups.length === 0) {
      rows.push([
        section.name,
        desc,
        "",
        "— (Sin subramas)",
        estadoRama,
        "",
        jefeRama || "",
      ]);
    } else {
      subgroups.forEach((sg) => {
        const nameFull = sg.name || "Subrama";
        // Inferir tipo de subrama desde el nombre (antes de ':' o primera palabra)
        let tipo = "";
        if (nameFull.includes(":")) tipo = nameFull.split(":")[0].trim();
        else if (nameFull.includes(" ")) tipo = nameFull.split(" ")[0].trim();

        const estado = sg.status === "active" ? "activa" : sg.status === "inactive" ? "inactiva" : sg.status || estadoRama;
        // Integrantes: no disponible en este modelo; si en el futuro llega como array/string, se puede mapear aquí
        const integrantes = "";

        rows.push([
          section.name,
          desc,
          tipo,
          nameFull,
          estado,
          integrantes,
          jefeRama || "",
        ]);
      });
    }
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download("organigrama_ramas.csv", csv);
}

export function exportLevelsCSV(data: OrganigramaNiveles) {
  const header = ["Nivel", "Cargo", "Titular", "Periodo", "Descripción"];
  const rows: string[][] = [];
  data.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      rows.push([nivel.nombre, "—", "—", String(data.anio ?? "—"), nivel.descripcion || "—"]);
    } else {
      nivel.cargos.forEach((c) => {
        const periodo = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        rows.push([nivel.nombre, c.nombre, c.titular || "—", periodo, c.descripcion || "—"]);
      });
    }
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download(`organigrama_niveles_${data.anio}.csv`, csv);
}

export function exportOrgChartCombinedPDF(
  branches: SimpleBranches,
  levels: OrganigramaNiveles,
  opts?: { year?: number }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const x = 40;
  let y = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 65, 52);
  const title = `Organigrama Completo${opts?.year ? ` – ${opts.year}` : ""}`;
  doc.text(title, x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, x, y + 16);

  // Branches/Subgroups section (encabezados iguales a la vista Ramas/Subramas)
  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Ramas y Subramas", x, y);

  const branchesBody: string[][] = [];
  branches.forEach(({ section, subgroups }) => {
    const uniqueLeaders = Array.from(new Set((subgroups || []).map((s) => s.leader).filter(Boolean) as string[]));
    const jefeRama = uniqueLeaders.join(", ");
    const desc = (section.description && String(section.description).trim())
      ? String(section.description)
      : (typeof section.minAge === 'number' && typeof section.maxAge === 'number' && section.minAge > 0 && section.maxAge > 0
          ? `${section.minAge}-${section.maxAge} años`
          : '—');
    const estadoRama = section.status === 'active' ? 'activa' : section.status === 'inactive' ? 'inactiva' : (section.status || '—');

    if (!subgroups || subgroups.length === 0) {
      branchesBody.push([
        section.name,
        desc,
        "",
        "— (Sin subramas)",
        estadoRama,
        "",
        jefeRama || "",
      ]);
    } else {
      subgroups.forEach((sg) => {
        const nameFull = sg.name || "Subrama";
        let tipo = "";
        if (nameFull.includes(":")) tipo = nameFull.split(":")[0].trim();
        else if (nameFull.includes(" ")) tipo = nameFull.split(" ")[0].trim();
        const estado = sg.status === "active" ? "activa" : sg.status === "inactive" ? "inactiva" : sg.status || estadoRama;
        const integrantes = "";

        branchesBody.push([
          section.name,
          desc,
          tipo,
          nameFull,
          estado,
          integrantes,
          jefeRama || "",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Rama", "Descripción", "TipoSubrama", "NombreSubrama", "Estado", "Integrantes", "JefeRama"]],
    body: branchesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  // Position after first table
  const anyDoc = doc as unknown as { lastAutoTable?: { finalY: number } };
  if (anyDoc.lastAutoTable?.finalY) {
    y = anyDoc.lastAutoTable.finalY + 30;
  } else {
    y += 200;
  }

  // Levels section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Niveles Organizativos", x, y);

  const levelsBody: (string | number)[][] = [];
  levels.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      levelsBody.push([nivel.nombre, "—", "—", "—", nivel.descripcion || "—"]);
    } else {
      nivel.cargos.forEach((c) => {
        const period = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        levelsBody.push([nivel.nombre, c.nombre, c.titular || "—", period, c.descripcion || "—"]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Nivel", "Cargo", "Titular", "Periodo", "Descripción"]],
    body: levelsBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  doc.save(`organigrama_completo_${opts?.year ?? ""}.pdf`);
}
