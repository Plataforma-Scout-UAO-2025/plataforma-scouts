import GroupsTable from "./components/GroupsTable";

const Grupos = () => {
  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">
          Gestión de Grupos
        </p>
      </header>
      <section className="mt-6">
        <GroupsTable />
      </section>
    </div>
  );
};

export default Grupos;
