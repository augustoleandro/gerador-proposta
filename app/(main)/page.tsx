import { signOut } from "@/actions/auth/actions";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>Gerador de Proposta</p>
      <form action={signOut}>
        <Button type="submit">Sair</Button>
      </form>
    </main>
  );
}
