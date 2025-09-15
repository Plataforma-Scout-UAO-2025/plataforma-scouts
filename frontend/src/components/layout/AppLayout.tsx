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
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LineChart, Boxes, CalendarDays, Settings, HelpCircle, LogOut } from "lucide-react"
import { Outlet, Link, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

type MenuItem = {
  id: string
  label: string
  icon: ReactNode
  href?: string
}

const mainItems: MenuItem[] = [
  { id: "inicio", label: "Inicio", icon: <LineChart />, href: "/app" },
  { id: "tropa", label: "Tropa", icon: <Boxes />, href: "/app/tropa" },
  { id: "eventos", label: "Eventos", icon: <CalendarDays />, href: "/app/eventos" },
  { id: "financiero", label: "Financiero", icon: <Settings />, href: "/app/financiero/cuotas" },
]

const bottomItems: MenuItem[] = [
  { id: "ayuda", label: "Ayuda", icon: <HelpCircle /> },
  { id: "logout", label: "Cerrar sesión", icon: <LogOut /> },
]

export default function AppLayout() {
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === "/app") {
      return location.pathname === "/app"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <SidebarProvider>
      <Sidebar
        className="bg-primary text-primary-foreground"
        collapsible="offcanvas"
      >
        <SidebarHeader className="p-4 bg-primary">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/80?img=12"
              alt="avatar"
              className="size-10 rounded-full object-cover"
            />
            <div className="leading-tight">
              <div className="text-base font-semibold">Juan Esteban Torres</div>
              <div className="text-xs opacity-80">MANADA KUNA</div>
            </div>
          </div>
          <SidebarSeparator className="my-4 bg-white/20" />
        </SidebarHeader>

        <SidebarContent className="px-2 bg-primary">
          <SidebarGroup>
            <SidebarGroupLabel className="sr-only">Menú principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto px-2 pb-4 bg-primary">
          <Separator className="bg-white/20 mb-4" />
          <SidebarMenu>
            {bottomItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton className="h-12 px-3 rounded-lg hover:bg-white/10">
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

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


