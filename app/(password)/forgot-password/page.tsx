"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import router from "next/router";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://proposta.automatize.com.br/forgot-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title:
            "Se um usuário com este email existir, um link de redefinição de senha será enviado.",
          variant: "success",
        });
        setEmail("");
        router.push("/signin");
      }
    } catch (error) {
      toast({
        title: "Ocorreu um erro ao solicitar a redefinição de senha.",
        variant: "destructive",
      });
      setError("Ocorreu um erro ao solicitar a redefinição de senha.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Esqueceu ou criando nova senha?
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
          <Button className="w-full">Enviar link de redefinição</Button>
        </form>
      </div>
    </div>
  );
}
