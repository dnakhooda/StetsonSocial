"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation/navigation";
import Event from "@/types/event";
import Footer from "@/components/footer/footer";
import { formatDate, formatTime } from "@/utils/formatDate";
import isPastEvent from "@/utils/pastEvent";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();

      const adminEvents = data
        .filter(
          (event: Event) => event.isAdminEvent && !isPastEvent(event.date)
        )
        .sort(
          (a: Event, b: Event) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setEvents(adminEvents);
    } catch (error: unknown) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = (eventTitle: string) => {
    router.push(`/events/${eventTitle}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Admin Events
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover and join exciting admin events happening in Stetson East!
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D41B2C] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-semibold font-['Lexend']">
                No admin events to display
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-[#D41B2C]"
                >
                  <div className="relative h-48">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D41B2C] flex items-center justify-center">
                        <span className="text-white text-2xl">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-semibold text-white">
                        {event.title}
                      </h3>
                      <p className="text-white">
                        {formatDate(event.date)} at {formatTime(event.time)}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-2">
                      Location: {event.location}
                    </p>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <p className="text-gray-600 mb-4">
                      Created by: {event.creatorName}
                    </p>
                    <button
                      onClick={() => handleJoinEvent(event.title)}
                      className="w-full bg-[#D41B2C] hover:bg-[#B31824] text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
