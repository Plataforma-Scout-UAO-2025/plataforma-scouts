import { useAuth0 } from '@auth0/auth0-react';
import StatsCards from '@/app/routes/guardians/dashboard/components/StatsCards';
import QuickActions from '@/app/routes/guardians/dashboard/components/QuickActions';
import { CompleteDataModal } from '@/app/routes/guardians/CompleteDataModal';
import { useGuardianProfile } from '@/app/routes/guardians/hooks/useGuardianProfile';
import FullScreenLoader from '@/components/common/FullScreenLoader';

export default function AcudienteView() {
    const { user } = useAuth0();
    const { guardian, isLoading, needsToCompleteProfile, reloadGuardian } = useGuardianProfile();

    // Mostrar loader mientras carga
    if (isLoading) {
        return <FullScreenLoader message="Cargando información..." />;
    }

    // Mostrar modal si necesita completar el perfil
    if (needsToCompleteProfile) {
        return <CompleteDataModal onComplete={reloadGuardian} />;
    }

	return (
		<div className="space-y-6">
			{/* Header de bienvenida */}
			<div className="text-center">
				<h1 className="text-3xl font-bold tracking-tight">
					¡Bienvenido, {guardian?.firstName || user?.nickname || user?.name}!
				</h1>
				<p className="text-muted-foreground">Panel de Acudiente</p>
			</div>			

			{/* Cards de resumen */}
			<div className="flex justify-center">
				<StatsCards />
			</div>

			{/* Acciones rápidas */}
			<QuickActions />
		</div>
	);
}
