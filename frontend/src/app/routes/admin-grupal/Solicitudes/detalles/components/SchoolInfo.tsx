import { useEffect, useState } from "react";
import type { SchoolData } from "@/types/enrollment.type";
import { getSchoolDataByMemberId } from "@/api/membersApi";

interface SchoolInfoProps {
  memberId?: number | string;
  
  
}

export default function SchoolInfo({ memberId }: SchoolInfoProps) {
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!memberId) {
        setSchoolData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSchoolDataByMemberId(memberId);
        setSchoolData(data || null);
      } catch {
        setError("Este usuario no tiene datos escolares.");
        setSchoolData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center text-gray-600">
        Cargando datos escolares...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-red-50 text-center text-sm text-gray-600">
        {error}
      </div>
    );
  }

  // Validar si hay datos
  const hasValidData = schoolData && Object.keys(schoolData).length > 0;
  if (!hasValidData) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Información Escolar
        </h3>
        <p className="text-sm text-gray-600">
          No se proporcionaron datos escolares para este miembro.
        </p>
      </div>
    );
  }

  const { institution, course, calendar, shift } = schoolData;

  const hasAnyValue = institution || course || calendar || shift;
  if (!hasAnyValue) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Información Escolar
        </h3>
        <p className="text-sm text-gray-600">
          Los datos escolares están vacíos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
        Información Escolar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Institución</p>
          <p className="font-medium text-gray-900">
            {institution || (
              <span className="text-gray-400 italic">No especificada</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Curso</p>
          <p className="font-medium text-gray-900">
            {course || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Calendario</p>
          <p className="font-medium text-gray-900">
            {calendar || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Jornada</p>
          <p className="font-medium text-gray-900">
            {shift || (
              <span className="text-gray-400 italic">No especificada</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
