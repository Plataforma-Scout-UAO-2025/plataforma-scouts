import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileHeaderProps {
  first_name: string;
  last_name: string;
  grupo: string;
  is_active: boolean;
}

export default function ProfileHeader({ first_name, last_name, grupo, is_active }: ProfileHeaderProps) {
const initials = `${(first_name ?? '').charAt(0)}${(last_name ?? '').charAt(0)}`;

  return (
  <Card className="mb-6">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src="" alt={`${first_name} ${last_name}`} />
            <AvatarFallback className="text-2xl bg-[#1a4134] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1a4134] mb-2">
              {first_name} {last_name}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{grupo}</p>
            <Badge 
              variant={is_active ? "default" : "secondary"}
              className={is_active ? "bg-green-100 text-green-800" : ""}
            >
              {is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
