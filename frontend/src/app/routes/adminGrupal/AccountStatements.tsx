import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import { Wallet } from "lucide-react";
import { membersData } from "@/lib/mockObjects";
import { useNavigate } from "react-router-dom";

const AccountStatements = () => {
  const navigate = useNavigate();

  const handleViewAccountDetails = (memberId: string) => {
    navigate(`/app/adminGrupal/estados/member`, { state: { memberId } });
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Estados de Cuenta</p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán los estados de cuenta del grupo.
        </p>
      </header>

      <section className="mt-6 space-y-4">
        <div className="border-3 border-primary rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="text-primary">
              <TableRow className="border-b border-primary hover:bg-transparent">
                <TableHead className="pl-4 font-bold text-primary">
                  Id
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Nombres
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Apellidos
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Identificación
                </TableHead>
                <TableHead className="font-bold text-primary">Ciudad</TableHead>
                <TableHead className="font-bold text-primary">Rama</TableHead>
                <TableHead className="font-bold text-primary">Estado de Cuenta</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersData.map((member) => (
                <TableRow key={member.id} className="border-primary">
                  <TableCell className="pl-4 font-medium">
                    {member.id}
                  </TableCell>
                  <TableCell>{member.firstName}</TableCell>
                  <TableCell>{member.lastName}</TableCell>
                  <TableCell>{member.identification}</TableCell>
                  <TableCell>{member.city}</TableCell>
                  <TableCell>{member.branch}</TableCell>
                  <TableCell>{member.statusAccount}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="iconbutton" 
                      size="icon"
                      onClick={() => handleViewAccountDetails(member.id)}
                    >
                      <Wallet />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default AccountStatements;
