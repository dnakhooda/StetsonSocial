"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/navigation/navigation";
import Event from "@/types/event";
import Footer from "@/components/footer/footer";
import isPastEvent from "@/utils/pastEvent";
import sortEvents from "@/utils/sortEvents";
import { useUserAuth } from "@/contexts/userAuthContext";

export default function PastEvents() {
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const router = useRouter();
  const { user, isAdmin } = useUserAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      const sortedEvents = sortEvents(data);
      const pastEvents = sortedEvents.filter((event) =>
        isPastEvent(event.date)
      );

      setPastEvents(pastEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
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
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Past Events</h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 rounded-lg transition border-2 text-black hover:bg-[#D41B2C] hover:text-white border-[#D41B2C] font-['Lexend']"
          >
            Back to Home
          </button>
        </div>

        {pastEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl font-semibold font-['Lexend']">
              No past events to display
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
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
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D41B2C]"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-semibold text-white">
                      {event.title}
                    </h3>
                    <p className="text-white">
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {new Date(`2000-01-01T${event.time}`).toLocaleTimeString(
                        [],
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
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
      </main>
      <Footer />
    </div>
  );
}
