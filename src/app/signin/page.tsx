"use client";

import { useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/userAuthContext";

export default function Home() {
  let router = useRouter();
  const { login } = useUserAuth();

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!router) {
      return;
    }
    router.push("/");
  };

  const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const user = await login();
    if (user) {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#D41B2C] flex items-center justify-center">
              <span
                className="text-white text-4xl font-serif font-light tracking-tighter leading-none"
                style={{ fontFamily: "Times New Roman" }}
              >
                N
              </span>
            </div>
            <h2 className="text-2xl font-bold text-black">Sign In</h2>
          </div>
          <button
            className="text-[#D41B2C] hover:text-[#B31824]"
            onClick={handleCloseClick}
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleSignIn}
            className="text-[#D41B2C] hover:text-[#B31824] font-semibold transition-all"
          >
            Sign in with Microsoft account!
          </button>
        </div>
      </div>
    </div>
  );
}
