import Link from "next/link";
import { Container } from "../ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-black">
            Lumina Cafe
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
              Menu
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
