import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/assets/images/logo-automatize.png"
        alt="Logo"
        width={40}
        height={40}
        suppressHydrationWarning
      />
      <span className="text-white text-sm uppercase font-semibold">
        Automatize
      </span>
    </div>
  );
}

export default Logo;
