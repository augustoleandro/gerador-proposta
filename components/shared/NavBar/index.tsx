import Link from "next/dist/client/link";
import DropdownAvatar from "./DropdownAvatar";
import Logo from "./Logo";

async function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between bg-primary px-16">
      <Link href="/">
        <Logo />
      </Link>
      <h2 className="h2 text-white flex-grow text-center">
        Gerador de Propostas
      </h2>

      <DropdownAvatar />
    </nav>
  );
}

export default Navbar;
