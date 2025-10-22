import { Check, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessCardProps {
  memberName: string;
  onViewMembers: () => void;
  onAddAnother: () => void;
}

export default function SuccessCard({ memberName, onViewMembers, onAddAnother }: SuccessCardProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>

          {/* Success Message */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Miembro agregado exitosamente!
            </h3>
            <p className="text-gray-600">
              {memberName} ha sido agregado a tu tropa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full max-w-md">
            <Button
              onClick={onViewMembers}
              className="flex-1 bg-[#1a4134] hover:bg-[#29765C]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Miembros
            </Button>
            <Button
              onClick={onAddAnother}
              variant="outline"
              className="flex-1 border-[#1a4134] text-[#1a4134] hover:bg-[#1a4134] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Otro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
