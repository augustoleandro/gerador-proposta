"use client";

import Image from "next/image";
import SignIn from "./components/SignIn/page";

function Auth() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 max-lg:bg-primary">
      <div className="flex-center min-h-screen px-12 ">
        <SignIn />
      </div>
      <div className="relative flex-col flex-center bg-primary max-lg:hidden bg-[url('/assets/images/bg-auth.png')] bg-cover bg-center h-screen">
        <div className="flex items-center justify-center mb-10">
          <Image
            src="/assets/images/logo-automatize.png"
            alt="Logo"
            width={100}
            height={100}
            className="z-10"
          />
          <span className="text-3xl z-10 text-white uppercase font-bold">
            Automatize
          </span>
        </div>

        <h1 className="h1 z-10 text-white">Gerador Automático de Propostas</h1>
        <span className="text-lg z-10 text-white">
          Suas propostas mais rápidas, bonitas e sem erros
        </span>
        <div className="absolute inset-0 bg-primary opacity-90"></div>
      </div>
    </div>
  );
}

export default Auth;
