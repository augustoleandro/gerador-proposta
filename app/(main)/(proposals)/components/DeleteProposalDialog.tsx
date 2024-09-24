"use client";

import { deleteProposal } from "@/actions/proposals/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Proposal } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface DeleteProposalDialogProps {
  proposalId: string;
}

export function DeleteProposalDialog({
  proposalId,
}: DeleteProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchProposal = async () => {
      const { data: proposal, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId);
      setProposal(proposal?.[0]);
    };
    fetchProposal();
  }, [proposalId, supabase]);

  const handleDeleteProposal = async () => {
    startTransition(async () => {
      try {
        const result = await deleteProposal(proposalId);
        toast({
          title: "Sucesso",
          description: result.message,
          variant: "success",
        });
        setOpen(false);
      } catch (error) {
        toast({
          title: "Erro",
          description:
            error instanceof Error
              ? error.message
              : "Ocorreu um erro ao deletar a proposta",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-8 w-8 p-0 text-destructive bg-transparent hover:bg-destructive hover:text-white"
          disabled={!(userId === proposal?.created_by)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deletar Proposta</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar esta proposta?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteProposal}
            disabled={isPending}
          >
            {isPending ? "Deletando..." : "Sim, deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
