"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation/navigation";
import Event from "@/types/event";
import Footer from "@/components/footer/footer";
import { formatDate, formatTime } from "@/utils/formatDate";
import isPastEvent from "@/utils/pastEvent";
import { useUserAuth } from "@/contexts/userAuthContext";

export default function PastAdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user, isAdmin } = useUserAuth();

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

      const pastAdminEvents = data
        .filter((event: Event) => event.isAdminEvent && isPastEvent(event.date))
        .sort(
          (a: Event, b: Event) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setEvents(pastAdminEvents);
    } catch (error: unknown) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, creatorId: string) => {
    if (!isAdmin && user?.uid !== creatorId) return;

    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/delete?userId=${
          user?.uid
        }&isAdmin=${isAdmin}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      fetchEvents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting event:", error.message);
        alert("Failed to delete event: " + error.message);
      } else {
        console.error("Error deleting event:", error);
        alert("Failed to delete event: " + String(error));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Past Admin Events
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              View past admin events that have taken place in Stetson East.
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
                No past admin events to display
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
                    {(isAdmin || user?.uid === event.creatorId) && (
                      <button
                        onClick={() =>
                          handleDeleteEvent(event.id, event.creatorId)
                        }
                        className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition bg-red-600 hover:bg-red-700"
                      >
                        Delete Event
                      </button>
                    )}
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
