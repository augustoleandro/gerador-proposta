import DropdownAvatar from "./DropdownAvatar";
import Logo from "./Logo";

async function Navbar() {
  return (
    <nav className="w-full h-24 flex items-center justify-between bg-primary px-16">
      <Logo />
      <h2 className="h2 text-white flex-grow text-center">
        Gerador de Propostas
      </h2>

      <DropdownAvatar />
    </nav>
  );
}

export default Navbar;
