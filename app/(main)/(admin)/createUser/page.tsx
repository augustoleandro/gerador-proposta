import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateUserForm from "./CreateUserForm";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's admin status from the users table
  const { data: userData, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !userData?.is_admin) {
    console.error("Error fetching user data or user is not an admin:", error);
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Novo Usuário</h1>
      <CreateUserForm />
    </div>
  );
}
