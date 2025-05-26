/**
 * Este arquivo contém funções para lidar com o login e cadastro de usuários.
 * Estas funções rodam no servidor e não no navegador do usuário.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

/**
 * Esta função verifica se o email e senha estão corretos para permitir o login.
 *
 * Como funciona:
 * 1. Recebe os dados do formulário de login (email e senha)
 * 2. Tenta fazer login no Supabase (nosso banco de dados)
 * 3. Se der erro, retorna a mensagem de erro
 * 4. Se der certo, atualiza a página e redireciona para a home
 */
export async function signin(
  prevState: { error: string | null },
  formData: FormData
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const supabase = createClient();

  // Extrai email e senha do formulário
  // Em um sistema real, faríamos mais validações aqui
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Esta função cria uma nova conta de usuário com email e senha.
 *
 * Como funciona:
 * 1. Recebe os dados do formulário de cadastro (email e senha)
 * 2. Tenta criar um novo usuário no Supabase
 * 3. Se der erro, redireciona para a página de erro
 * 4. Se der certo, atualiza a página e redireciona para a home
 */
export async function signup(formData: FormData) {
  const supabase = createClient();

  // Extrai email e senha do formulário
  // Em um sistema real, faríamos mais validações aqui
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Esta função faz o logout do usuário.
 *
 * Como funciona:
 * 1. Envia comando de logout para o Supabase
 * 2. Redireciona o usuário para a página de login
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
