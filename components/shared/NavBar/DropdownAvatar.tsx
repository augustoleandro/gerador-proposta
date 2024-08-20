"use client";

import { signOut } from "@/actions/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import React from "react";

function DropdownAvatar() {
  const supabase = createClient();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id);
        setUser(data?.[0]);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none border-4 border-purple-600 rounded-full">
          <Avatar className="bg-background">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {`${user?.first_name?.[0] ?? ""}${
                user?.last_name?.[0] ?? ""
              }`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className=" text-white text-sm">{user?.first_name}</span>
    </div>
  );
}

export default DropdownAvatar;
