"use client";

import Footer from "@/components/footer/footer";
import Navigation from "@/components/navigation/navigation";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden flex flex-col justify-between">
      <style jsx>{`
        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("/images/krentzman-quad.png");
          background-size: cover;
          background-position: center;
          opacity: 0.5;
          filter: brightness(1.2) saturate(1.1);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
      <div className="background-image" />
      <Navigation />
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
