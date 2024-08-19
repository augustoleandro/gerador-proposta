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
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const user = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id);
        setUser(user.data?.[0] as User | null);
        console.log(user.data?.[0]);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>
            {user?.email?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          <button onClick={() => signOut()} className="cursor-pointer">
            Sair
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropdownAvatar;
