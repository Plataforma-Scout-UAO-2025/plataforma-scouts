import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  grupo: string;
  isActive: boolean;
}

export default function ProfileHeader({ firstName, lastName, grupo, isActive }: ProfileHeaderProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <Card className="mb-6">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src="" alt={`${firstName} ${lastName}`} />
            <AvatarFallback className="text-2xl bg-[#1a4134] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1a4134] mb-2">
              {firstName} {lastName}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{grupo}</p>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-100 text-green-800" : ""}
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
