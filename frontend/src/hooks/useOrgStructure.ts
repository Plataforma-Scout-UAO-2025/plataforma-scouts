import { useEffect, useState, useCallback } from "react";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";
import {
  getGroupsByTenant,
  getSections,
  getSubgroups,
} from "@/api/organigramaApi";

export interface Group {
  groupId: number;
  groupName: string;
  groupSlug: string;
}

interface UseOrgStructureOptions {
  orgId: string;
  open: boolean;
}

export function useOrgStructure({ orgId, open }: UseOrgStructureOptions) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);

  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>("");

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubgroups, setLoadingSubgroups] = useState(false);

  const resetSelections = useCallback(() => {
    setSelectedGroupSlug("");
    setSelectedSection("");
    setSelectedSubgroup("");
    setSections([]);
    setSubgroups([]);
  }, []);

  useEffect(() => {
    if (!orgId || !open) return;

    const ac = new AbortController();
    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const data = await getGroupsByTenant(orgId, ac.signal);

        const mapped: Group[] = (data ?? []).map((g: any) => ({
          groupId: (g.groupId ?? g.id) as number,
          groupName: (g.groupName ?? g.name) as string,
          groupSlug: (g.groupSlug ?? g.slug) as string,
        }));

        setGroups(mapped);

        if (mapped.length === 1) {
          setSelectedGroupSlug(mapped[0].groupSlug);
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Error al cargar grupos:", e);
          setGroups([]);
        }
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
    return () => ac.abort();
  }, [orgId, open]);

  useEffect(() => {
    if (!orgId || !selectedGroupSlug || !open) {
      setSections([]);
      return;
    }

    const ac = new AbortController();
    const loadSections = async () => {
      setLoadingSections(true);
      try {
        const data = await getSections(orgId, selectedGroupSlug);
        setSections(data ?? []);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Error al cargar secciones:", e);
          setSections([]);
        }
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
    return () => ac.abort();
  }, [orgId, open, selectedGroupSlug]);

  useEffect(() => {
    if (!orgId || !selectedGroupSlug || !selectedSection) {
      setSubgroups([]);
      return;
    }

    const ac = new AbortController();
    const loadSubgroups = async () => {
      setLoadingSubgroups(true);
      try {
        const data = await getSubgroups(
          Number(selectedSection),
          orgId,
          selectedGroupSlug
        );
        setSubgroups(data ?? []);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Error al cargar subgrupos:", e);
          setSubgroups([]);
        }
      } finally {
        setLoadingSubgroups(false);
      }
    };

    loadSubgroups();
    return () => ac.abort();
  }, [orgId, selectedGroupSlug, selectedSection]);

  return {
    groups,
    sections,
    subgroups,
    selectedGroupSlug,
    setSelectedGroupSlug,
    selectedSection,
    setSelectedSection,
    selectedSubgroup,
    setSelectedSubgroup,
    loadingGroups,
    loadingSections,
    loadingSubgroups,
    resetSelections,
  };
}
