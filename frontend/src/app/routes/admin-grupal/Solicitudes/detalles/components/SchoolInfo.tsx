import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchSchoolDataMemberAction } from "@/store/members/membersActions";
import { Label } from "@/components/ui/label";

interface SchoolInfoProps {
  memberId?: number | string;
}

export default function SchoolInfo({ memberId }: SchoolInfoProps) {
  const dispatch = useAppDispatch();

  const schoolData = useAppSelector((state) =>
    state.members.schoolDataByMember?.[Number(memberId)] || null
  );
  const loading = useAppSelector((state) => state.members.loadingSchoolData);
  const error = useAppSelector((state) => state.members.errorSchoolData);

  useEffect(() => {
    if (!memberId) {
      return;
    }
    dispatch(fetchSchoolDataMemberAction(Number(memberId)));
  }, [memberId, dispatch]);

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
        {typeof error === 'string' ? error : "Error al cargar los datos escolares."}
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
          Información Escolar
        </h3>
        <div className="border rounded-lg p-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            Este miembro no tiene datos escolares registrados.
          </p>
        </div>
      </div>
    );
  }

  const { institution, course, calendar, shift } = schoolData;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
        Información Escolar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Institución</Label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {institution || (
              <span className="text-gray-400 italic">No especificada</span>
            )}
          </div>
        </div>
        <div>
          <Label>Curso</Label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {course || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </div>
        </div>
        <div>
          <Label>Calendario</Label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {calendar || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </div>
        </div>
        <div>
          <Label>Jornada</Label>
          <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {shift || (
              <span className="text-gray-400 italic">No especificada</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}