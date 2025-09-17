import { useLocation } from "react-router-dom";
import {
  Button,
  BackButton,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import { Pencil, Trash } from "lucide-react";
import { membersData } from "@/lib/mockObjects";

const MemberStatements = () => {
  const location = useLocation();
  const { memberId } = location.state || {};

  const member = membersData.find((member) => member.id === memberId);

  console.log("Member ID:", memberId);
  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Estados de Cuenta</p>
      </header>
      <Separator className="my-4 border-b border-primary" />
      <section>
      <BackButton />
        {member && (
          <div key={member.id} className="p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              {member.firstName} {member.lastName}
            </h3>
          </div>
        )}
      </section>

      <div className="border-3 border-primary rounded-lg overflow-hidden">
        <Table className="text-sm">
          <TableHeader className="text-primary">
            <TableRow className="border-b border-primary hover:bg-transparent">
              <TableHead className="pl-4 font-bold text-primary">
                Número de Orden
              </TableHead>
              <TableHead className="font-bold text-primary">Concepto</TableHead>
              <TableHead className="font-bold text-primary">Valor</TableHead>
              <TableHead className="font-bold text-primary">Fecha</TableHead>
              <TableHead className="font-bold text-primary">Estado</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {member?.orders.map((order) => (
              <TableRow key={order.orderNumber} className="border-primary">
                <TableCell className="pl-4 font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>{order.concept}</TableCell>
                <TableCell>{order.value}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="iconbutton"
                    size="icon"
                    className="text-secondary hover:text-blue-800"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="iconbutton"
                    size="icon"
                    className="text-destructive hover:text-destructive-hover"
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MemberStatements;
