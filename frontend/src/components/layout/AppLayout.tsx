import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  LineChart,
  Boxes,
  CalendarDays,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  Award,
  ChevronRight,
  Network,
} from "lucide-react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ReactNode } from "react"
import { useAuth0 } from '@auth0/auth0-react';
import { useRoleContext } from '@/hooks/useRoleContext';
import FullScreenLoader from '@/components/common/FullScreenLoader';
import FullScreenError from '@/components/common/FullScreenError';

type SubMenuItem = {
  id: string
  label: string
  icon: ReactNode
  href?: string
  submenu?: SubMenuItem[]
}

type MenuItem = {
  id: string
  label: string
  icon: ReactNode
  href?: string
  submenu?: SubMenuItem[]
}

//const mainItems: MenuItem[] = [
//  { id: "inicio", label: "Inicio", icon: <LineChart />, href: "/app/home" },
//  { id: "info-medica", label: "Grupos", icon: <Settings />, href: "/app/grupos" },
//]

const adminGlobalItems: MenuItem[] = [
  { id: "inicio", label: "Inicio", icon: <LineChart />, href: "/app/dashboard-global" },
]

const adminGrupalItems: MenuItem[] = [
  { id: "inicio", label: "Inicio", icon: <LineChart />, href: "/app/dashboard" },
  { id: "organigrama", label: "Organigrama", icon: <Network />, href: "/app/organigrama" },
  { id: "miembros", label: "Miembros", icon: <Users />, href: "/app/miembros" },
  { id: "solicitudes", label: "Solicitudes", icon: <Boxes />, href: "/app/solicitudes" },
  { id: "insignias", label: "Insignias", icon: <Award />, href: "/app/insignias" },
  { id: "eventos", label: "Eventos", icon: <CalendarDays />, href: "/app/eventos" },
  { id: "financiero", label: "Financiero", icon: <Settings />, href: "/app/financiero/cuotas" },
]

const bottomItems: MenuItem[] = [
  { id: "ayuda", label: "Ayuda", icon: <HelpCircle /> },
  { id: "logout", label: "Cerrar sesión", icon: <LogOut /> },
]

function AppLayoutContent() {
  const location = useLocation()
  const isAdminGlobalRoute = location.pathname.startsWith('/app/adminGlobal')
  const menuItems = isAdminGlobalRoute ? adminGlobalItems : adminGrupalItems
  const { user, logout } = useAuth0();
  const { status, currentUserRoleLabel, error, retry } = useRoleContext();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const isActive = (href: string) => {
    if (!href) return false
    if (href === "/app") {
      return location.pathname === "/app"
    }
    return location.pathname.startsWith(href)
  }

  if (status === 'idle' || status === 'loading') {
    return <FullScreenLoader message="Estamos dejando todo listo para ti!" />;
  }
  if (status === 'error') {
    return (
      <FullScreenError
        message={error || 'No pudimos cargar tu rol. Por favor intenta más tarde o recarga la página.'}
        onRetry={retry}
      />
    );
  }

  return (
    <SidebarProvider>
      <Sidebar
        className="bg-primary text-primary-foreground"
        collapsible="offcanvas"
      >
        {/* Header */}
        <SidebarHeader className="p-4 bg-primary">
          <div className="flex items-center gap-3">
            <img
              src={user?.picture}
              alt="avatar"
              className="size-10 rounded-full object-cover"
            />
            <div className="leading-tight">
              <div className="text-base font-semibold">{user?.nickname}</div>
              <div className="text-xs opacity-80">MANADA KUNA</div>
              <div className="text-xs opacity-80">{currentUserRoleLabel}</div>
            </div>
          </div>
          <SidebarSeparator className="my-4 bg-white/20" />
        </SidebarHeader>

        {/* Menu */}
        <SidebarContent className="px-2 bg-primary">
          <SidebarGroup>
            <SidebarGroupLabel className="sr-only">Menú principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) =>
                  item.submenu ? (
                    <Collapsible key={item.id} defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="text-base h-12 px-3 rounded-lg hover:bg-white/10 data-[state=open]:bg-white/20 data-[state=open]:font-semibold data-[state=open]:text-white">
                            {item.icon}
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenu.map((sub) => (
                              <SidebarMenuSubItem key={sub.id}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={sub.href ? isActive(sub.href) : false}
                                  className="text-sm h-10 px-3 rounded-md hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:font-medium data-[active=true]:text-white"
                                >
                                  {sub.href ? (
                                    <Link to={sub.href}>
                                      {sub.icon}
                                      <span>{sub.label}</span>
                                    </Link>
                                  ) : (
                                    <div>
                                      {sub.icon}
                                      <span>{sub.label}</span>
                                    </div>
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.href ? isActive(item.href) : false}
                        className="text-base h-12 px-3 rounded-lg hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:font-semibold data-[active=true]:text-white"
                      >
                        {item.href ? (
                          <Link to={item.href}>
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <div>
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="mt-auto px-2 pb-4 bg-primary">
          <Separator className="bg-white/20 mb-4" />
          <SidebarMenu>
            {bottomItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  className="h-12 px-3 rounded-lg hover:bg-white/10"
                  onClick={item.id === "logout" ? handleLogout : undefined}
                >
                  {item.id === "logout" ? (
                    <><LogOut /><span>Cerrar sesión</span></>
                  ) : (
                    <>
                      {item.icon}
                      <span>{item.label}</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Contenido principal */}
      <SidebarInset className="flex flex-col h-screen">
        <header className="flex h-14 items-center gap-2 border-b px-4 flex-shrink-0">
          <SidebarTrigger />
          <div className="font-medium">Área de trabajo</div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AppLayout() {
  return <AppLayoutContent />;
}
