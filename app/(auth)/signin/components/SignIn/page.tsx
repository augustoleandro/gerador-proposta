"use client";

import { signin } from "@/actions/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle, LogIn } from "lucide-react";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      {status.pending ? (
        <>
          <span className="animate-spin">
            <LoaderCircle size={16} />
          </span>
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}

function SignIn() {
  const [state, formAction] = useFormState(signin, {
    error: null,
  } as { error: string | null });

  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Erro",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <div className="bg-slate-100 rounded-lg px-10 py-6 min-w-96 flex flex-col w-full">
      <div className="flex flex-col gap-4 flex-center">
        <h2 className="flex-center gap-2 h2 text-primary max-lg:hidden">
          <LogIn size={24} className="text-primary" />
          Acesso
        </h2>
        <h2 className="lg:hidden flex h2 text-primary ">Gerador de Proposta</h2>
        <span className=" text-slate-500">
          Entre com email e senha para efetuar o seu acesso
        </span>
      </div>
      <form action={formAction} className="flex flex-col w-full mt-6 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="email" className="text-primary mb-2">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Insira seu email @automatize.com.br"
            className="placeholder:text-slate-300 text-slate-800"
            required
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="password" className="text-primary mb-2">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Insira sua senha..."
            className="placeholder:text-slate-300 text-slate-800"
            required
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

export default SignIn;
