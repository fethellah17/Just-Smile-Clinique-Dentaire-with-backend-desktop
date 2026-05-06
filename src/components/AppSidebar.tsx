import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  KeyRound,
} from "lucide-react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Tableau de Bord", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Rendez-vous", url: "/rendez-vous", icon: Calendar },
];

const configItems = [
  { title: "Catégories de Soins", url: "/configurations/categories", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const router = useRouter();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-muted/20 transition-all duration-300 overflow-hidden">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <img 
              src="/images/logo.jpg" 
              alt="Just Smile" 
              className="min-w-[40px] w-[40px] h-[40px] rounded object-contain border border-border flex-shrink-0" 
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <img 
              src="/images/logo.jpg" 
              alt="Just Smile" 
              className="min-w-[40px] w-[40px] h-[40px] rounded object-contain border border-border flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-sidebar-foreground truncate">Just Smile</h2>
              <p className="text-xs text-muted-foreground truncate">Clinique Dentaire</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-3">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-3">Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setChangePasswordOpen(true)}
              tooltip="Modifier le mot de passe"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <KeyRound className="h-4 w-4" />
              <span>Modifier le mot de passe</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Déconnexion"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!collapsed && (
          <div className="px-4 py-3 border-t border-sidebar-border bg-muted/30 flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Dev by:</p>
            <p className="text-[10px] text-foreground font-medium truncate">Hadj-bouziane Fethellah</p>
            <a 
              href="mailto:Fethellahhadjbouziane@gmail.com"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors break-all hover:underline"
              title="Fethellahhadjbouziane@gmail.com"
            >
              Fethellahhadjbouziane@gmail.com
            </a>
          </div>
        )}
      </SidebarFooter>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </Sidebar>
  );
}
