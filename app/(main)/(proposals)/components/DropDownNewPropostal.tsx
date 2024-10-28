"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function DropDownNewPropostal() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuItem
          onClick={() => router.push("/gyn/novaproposta")}
          className="cursor-pointer"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Goiânia
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/bsb/novaproposta")}
          className="cursor-pointer"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Brasília
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropDownNewPropostal;
