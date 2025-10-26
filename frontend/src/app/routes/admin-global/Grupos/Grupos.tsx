import GroupsTable from "./components/GroupsTable";

const Grupos = () => {
  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">
          Gestión de Miembros Aprobados
        </p>
      </header>
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
        <GroupsTable />
      </section>
    </div>
  );
};

export default Grupos;
