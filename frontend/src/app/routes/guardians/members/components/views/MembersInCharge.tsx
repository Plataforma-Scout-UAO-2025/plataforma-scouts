import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf"

const MembersInCharge = () => {
  // Pasar el guardianId al hook y eliminar dispatch duplicado
  const { members, loading, error } = useMembersInChargeOf(309);
  
  console.log("members from hook:", members);
  console.log("loading:", loading);
  console.log("error:", error);

  if (loading) {
    return <div>Cargando miembros...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Miembros a Cargo</h1>
      <p>Total: {members.length}</p>
      {members.length > 0 ? (
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              {member.firstName} {member.lastName} - {member.gender} - {member.phone}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay miembros a cargo</p>
      )}
    </div>
  );
};

export default MembersInCharge;