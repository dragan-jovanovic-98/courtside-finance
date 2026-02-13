import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Separator } from "@/components/ui/separator";

export function Sidebar({
  fullName,
  email,
  onNavigate,
}: {
  fullName: string | null;
  email: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-6">
        <span className="text-lg font-semibold tracking-tight">Courtside</span>
      </div>
      <Separator />
      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      {/* User menu */}
      <Separator />
      <div className="p-3">
        <UserMenu fullName={fullName} email={email} />
      </div>
    </div>
  );
}
