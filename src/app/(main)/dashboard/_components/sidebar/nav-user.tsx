"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Harf avatar için:
function getInitials(nameOrEmail: string = "") {
  if (!nameOrEmail) return "U";
  const parts = nameOrEmail.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nameOrEmail[0].toUpperCase() + (nameOrEmail[1] ? nameOrEmail[1].toUpperCase() : "");
}

export function NavUser({ user }: { user: any }) {
  if (!user) return null;

  const name =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const email = user?.email || "";
  const avatar = user?.user_metadata?.avatar || user?.avatar || undefined;

  return (
    <div className="flex items-center gap-3 p-3">
      <Avatar className="h-9 w-9 rounded-lg grayscale">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}
