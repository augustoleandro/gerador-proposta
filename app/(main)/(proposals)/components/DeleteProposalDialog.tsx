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
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

interface DeleteProposalDialogProps {
  proposalId: string;
}

export function DeleteProposalDialog({
  proposalId,
}: DeleteProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        <Button className="h-8 w-8 p-0 text-destructive bg-transparent hover:bg-destructive hover:text-white">
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
