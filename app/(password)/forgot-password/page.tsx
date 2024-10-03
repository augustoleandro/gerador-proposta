"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react"; // Importe o ícone de carregamento
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Novo estado para controlar o carregamento
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Inicia o carregamento

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://proposta.automatize.com.br/new-password",
      });

      if (error) {
        throw error;
      }

      toast({
        title:
          "Se um usuário com este email existir, um link de redefinição de senha será enviado.",
        variant: "success",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Ocorreu um erro ao solicitar a redefinição de senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Finaliza o carregamento, independentemente do resultado
      router.push("/signin");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Esqueceu sua senha?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link de redefinição"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
