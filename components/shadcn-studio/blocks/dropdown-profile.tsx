"use client";

import type { ReactNode } from "react";

import {
  SettingsIcon,
  CreditCardIcon,
  Building2Icon,
  LogOutIcon,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, subscription } from "@/lib/auth-client";
import { useOrganization } from "@/hooks/use-organization";
import { useRouter } from "next/navigation";

type Props = {
  trigger: ReactNode;
  user?: {
    name?: string;
    email?: string;
    image?: string | null;
  };
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const ProfileDropdown = ({
  trigger,
  user,
  defaultOpen,
  align = "end",
}: Props) => {
  const router = useRouter();
  const { data: organization } = useOrganization();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align={align || "end"}>
        <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
          <div className="relative">
            <Avatar className="size-10">
              <AvatarImage
                src={
                  user?.image ||
                  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                }
                alt={user?.name || "User"}
              />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="text-foreground text-lg font-semibold">
              {user?.name || "User"}
            </span>
            <span className="text-muted-foreground text-base">
              {user?.email || ""}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="px-4 py-2.5 text-base cursor-pointer"
            onClick={() => router.push("/dashboard/settings")}
          >
            <SettingsIcon className="text-foreground size-5" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-4 py-2.5 text-base cursor-pointer"
            onClick={async () => {
              try {
                const { data, error } = await subscription.billingPortal({
                  returnUrl: window.location.href,
                });
                if (error) {
                  console.error("Billing portal error:", error);
                  // Fallback to settings
                  router.push("/dashboard/settings");
                } else if (data?.url) {
                  window.location.href = data.url;
                }
              } catch (error) {
                console.error("Failed to open billing portal:", error);
                router.push("/dashboard/settings");
              }
            }}
          >
            <CreditCardIcon className="text-foreground size-5" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="px-4 py-2.5 text-base cursor-pointer"
            onClick={() => {
              if (organization) {
                router.push(`/dashboard/organizations/${organization.id}`);
              } else {
                router.push("/dashboard");
              }
            }}
          >
            <Building2Icon className="text-foreground size-5" />
            <span>Organizations</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="px-4 py-2.5 text-base cursor-pointer"
          onClick={() => handleLogout()}
        >
          <LogOutIcon className="size-5" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
