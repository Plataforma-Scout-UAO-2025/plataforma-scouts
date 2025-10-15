import { useEffect, useState, useCallback } from "react";
import type { Section } from "@/types/section.type";
import type { Subgroup } from "@/types/subgroup.type";
import api from "@/api/axios";

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
    const loadGroups = async () => {
      if (!orgId || !open) return;
      setLoadingGroups(true);
      try {
        const { data } = await api.get<Group[]>(`/tenants/${orgId}/groups`);
        setGroups(data ?? []);
        if (data?.length === 1) {
          setSelectedGroupSlug(data[0].groupSlug);
        }
      } catch (e) {
        console.error("Error al cargar grupos:", e);
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadGroups();
  }, [orgId, open]);

  useEffect(() => {
    const fetchSections = async () => {
      if (!orgId || !selectedGroupSlug || !open) {
        setSections([]);
        return;
      }
      setLoadingSections(true);
      try {
        const { data } = await api.get<Section[]>(
          `/tenants/${orgId}/groups/${selectedGroupSlug}/sections`
        );
        setSections(data ?? []);
      } catch (e) {
        console.error("Error al cargar secciones:", e);
        setSections([]);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [orgId, open, selectedGroupSlug]);

  useEffect(() => {
    const fetchSubgroups = async () => {
      if (!orgId || !selectedGroupSlug || !selectedSection) {
        setSubgroups([]);
        return;
      }
      setLoadingSubgroups(true);
      try {
        const { data } = await api.get<Subgroup[]>(
          `/tenants/${orgId}/groups/${selectedGroupSlug}/sections/${selectedSection}/subgroups`
        );
        setSubgroups(data ?? []);
      } catch (e) {
        console.error("Error al cargar subgrupos:", e);
        setSubgroups([]);
      } finally {
        setLoadingSubgroups(false);
      }
    };
    fetchSubgroups();
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
