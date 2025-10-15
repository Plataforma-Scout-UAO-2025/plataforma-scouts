import { Button } from "@/components/ui/button";

export default function SuccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-primary">
          ¡Solicitud enviada con éxito!
        </h3>
        <p className="mb-6 text-gray-700">
          Un encargado revisará tu solicitud y se comunicará contigo pronto.
        </p>
        <Button className="w-full" onClick={onClose}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
