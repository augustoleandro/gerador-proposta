"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

function SignIn() {
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
      <form className="flex flex-col w-full mt-6 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="email" className="text-primary mb-2">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Insira seu email @automatize.com.br"
            className="placeholder:text-slate-300 text-slate-800"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="senha" className="text-primary mb-2">
            Senha
          </Label>
          <Input
            id="senha"
            type="password"
            placeholder="Insira sua senha..."
            className="placeholder:text-slate-300 text-slate-800"
          />
        </div>
        <Button type="submit" className="bg-primary text-white">
          Entrar
        </Button>
      </form>
    </div>
  );
}

export default SignIn;
