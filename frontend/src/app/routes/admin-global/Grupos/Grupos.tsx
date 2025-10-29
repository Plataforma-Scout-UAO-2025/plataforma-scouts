import { useState } from "react";
import GroupsTable from "./components/GroupsTable";
import { Button } from "@/components/ui/index";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import CreateGroupModal from "./detalles/CreateGroupModal";

const Grupos = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { handleCreateGroup } = useGroupManagement();

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">Gestión de Grupos</p>
        <Button
          variant="primary"
          onClick={() => handleCreateGroup(setIsCreateModalOpen)}
        >
          Crear Nuevo Grupo
        </Button>
      </header>
      <section className="mt-6">
        <GroupsTable />
      </section>
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default Grupos;
