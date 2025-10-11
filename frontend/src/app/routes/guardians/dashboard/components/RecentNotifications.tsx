import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, DollarSign, UserCheck } from 'lucide-react';

export default function RecentNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Nuevo evento disponible</p>
              <p className="text-xs text-muted-foreground">Campamento de Otoño - Inscripciones abiertas hasta el 10 de octubre</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Recordatorio de pago</p>
              <p className="text-xs text-muted-foreground">Cuota mensual de octubre vence el 31 de octubre</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Actividad completada</p>
              <p className="text-xs text-muted-foreground">José Alberto participó en la actividad de servicio comunitario</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
