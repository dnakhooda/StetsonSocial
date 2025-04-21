import { useUserAuth } from "@/contexts/userAuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const { user, isAdmin, logout } = useUserAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!router) {
      return;
    }
    router.push("/signin");
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await logout();
    router.push(`/`);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="h-auto min-h-20 bg-gradient-to-r from-black via-black to-[#D41B2C] shadow-lg relative z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center space-x-6 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-12 h-12 bg-[#D41B2C] flex items-center justify-center">
              <span
                className="text-white text-4xl font-serif font-light tracking-tighter leading-none"
                style={{ fontFamily: "Times New Roman" }}
              >
                N
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">Stetson Social</h1>
          </button>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
            >
              Contact
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden md:inline text-white text-lg font-medium font-['Lexend'] px-4 py-2">
                  Welcome, {user.displayName}!
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-white hover:bg-[#D41B2C] text-black hover:text-white font-semibold py-2 px-4 rounded-lg transition w-full md:w-auto"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClick}
                  className="bg-white hover:bg-[#D41B2C] text-black hover:text-white font-semibold py-2 px-4 rounded-lg transition w-full md:w-auto"
                >
                  Sign In
                </button>
              </>
            )}
          </nav>
        </div>

        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "opacity-100 max-h-[500px] mt-4 pb-4"
              : "opacity-0 max-h-0 overflow-hidden mt-0 pb-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 items-end">
            <Link
              href="/"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-white hover:text-white hover:font-bold transition-all duration-300 text-lg font-medium tracking-wide px-4 py-2 rounded-lg hover:-translate-y-1.5 hover:scale-107 inline-block font-['Lexend']"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden md:inline text-white text-lg font-medium font-['Lexend'] px-4 py-2">
                  Welcome, {user.displayName}!
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-white hover:bg-[#D41B2C] text-black hover:text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClick}
                  className="bg-white hover:bg-[#D41B2C] text-black hover:text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Sign In
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
