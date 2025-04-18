"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navigation from "@/components/navigation/navigation";
import Event from "@/types/event";
import Footer from "@/components/footer/footer";

interface Edit {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

interface Participant {
  name: string;
  username: string;
  id: string;
}

interface EnhancedEventData extends Event {
  participants: Participant[];
}

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = { data: null };
  const eventTitle = params.eventTitle;
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [eventData, setEventData] = useState<EnhancedEventData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Edit>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  useEffect(() => {
    //initializeEvents();
  }, []);

  useEffect(() => {
    if (eventData) {
      setEditForm({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
      });
    }
  }, [eventData]);

  const isEventOwner = false; //session?.user?.id === eventData?.creatorId;
  const isAdmin = false; //session?.user?.admin;
  const canManageEvent = isEventOwner || isAdmin;

  const isPastEvent = (date: string, time: string) => {
    const now = new Date();
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime < now;
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const events: Event[] = await response.json();

        const event = events.find(
          (e: Event) =>
            e.title === decodeURIComponent(params.eventTitle as string)
        );

        if (!event) {
          throw new Error("Event not found");
        }

        const attendeesWithDetails = await Promise.all(
          event.attendees.map(async (userId) => {
            const userDetails = await fetchUserDetails(userId);
            return {
              name: userDetails?.name || "Unknown User",
              username: userDetails?.email || "@unknown",
              id: userDetails?.id || "-1",
            };
          })
        );

        const transformedEvent = {
          id: event.id,

          creatorId: event.creatorId,
          creatorName: event.creatorName,

          title: event.title,
          description: event.description,
          location: event.location,
          imageUrl: event.imageUrl,
          date: event.date,
          time: event.time,

          attendees: event.attendees,
          participants: attendeesWithDetails,
        };

        setEventData(transformedEvent);

        if (false /*session?.user?.id*/) {
          //setIsSignedUp(event.attendees.includes(/*session.user.id*/));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching event:", error.message);
          setError(error.message);
        } else {
          console.error("Error fetching event:", error);
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [params.eventTitle /*, session?.user?.id*/]);

  const handleSignUp = async () => {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (!eventData?.id) {
      alert("Error: Event ID not found");
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventData.id}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join event");
      }

      setIsSignedUp(true);

      const updatedResponse = await fetch("/api/events");
      const events = await updatedResponse.json();
      const updatedEvent = events.find((e: Event) => e.id === eventData.id);

      if (updatedEvent) {
        const attendeesWithDetails = await Promise.all<Participant[]>(
          updatedEvent.attendees.map(async (userId: string) => {
            const userDetails = await fetchUserDetails(userId);
            return {
              name: userDetails?.name || "Unknown User",
              username: userDetails?.email || "@unknown",
              id: userDetails?.id || "-1",
            };
          })
        );

        setEventData((prev) =>
          prev
            ? {
                ...prev,
                attendees: updatedEvent.attendees,
                participants: attendeesWithDetails,
              }
            : null
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error joining event:", error.message);
        alert("Failed to join event: " + error.message);
      } else {
        console.error("Error joining event:", error);
        alert("Failed to join event: " + String(error));
      }
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    try {
      const response = await fetch(`/api/events/${eventData?.id}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove participant");
      }

      // Refresh event data
      const updatedResponse = await fetch("/api/events");
      const events = await updatedResponse.json();
      const updatedEvent = events.find((e: Event) => e.id === eventData?.id);

      if (updatedEvent) {
        // Fetch user details for all attendees
        const attendeesWithDetails = await Promise.all(
          updatedEvent.attendees.map(async (userId: string) => {
            const userDetails = await fetchUserDetails(userId);
            return {
              name: userDetails?.name || "Unknown User",
              username: userDetails?.email || "@unknown",
              id: userDetails?.id || "-1",
            };
          })
        );

        setEventData((prev) =>
          prev
            ? {
                ...prev,
                attendees: updatedEvent.attendees,
                participants: attendeesWithDetails,
              }
            : null
        );

        if (/*userId === session?.user?.id*/ false) {
          //setIsSignedUp(false);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error removing participant:", error.message);
        alert("Failed to remove participant: " + error.message);
      } else {
        console.error("Error removing participant:", error);
        alert("Failed to remove participant: " + String(error));
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!canManageEvent) return;

    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventData?.id}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      router.push("/");
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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManageEvent) return;

    try {
      const response = await fetch(`/api/events/${eventData?.id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event");
      }

      // Refresh event data
      const updatedResponse = await fetch("/api/events");
      const events = await updatedResponse.json();
      const updatedEvent = events.find((e: Event) => e.id === eventData?.id);

      if (updatedEvent) {
        setEventData((prev) =>
          prev
            ? {
                ...prev,
                ...updatedEvent,
                participants: prev.participants,
              }
            : null
        );
        setIsEditing(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating event:", error.message);
        alert("Failed to update event: " + error.message);
      } else {
        console.error("Error updating event:", error);
        alert("Failed to update event: " + String(error));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D41B2C] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      <style jsx>{`
        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("/krentzman-quad.png");
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

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="w-full h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={eventData.imageUrl}
                alt={eventData.title}
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = "/krentzman-quad.png";
                }}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h1 className="text-3xl font-bold mb-4">{eventData.title}</h1>
              <p className="text-gray-600 mb-6">{eventData.description}</p>

              <div className="space-y-4 mb-6">
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D41B2C] focus:ring-[#D41B2C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D41B2C] focus:ring-[#D41B2C]"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D41B2C] focus:ring-[#D41B2C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e) =>
                          setEditForm({ ...editForm, time: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D41B2C] focus:ring-[#D41B2C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D41B2C] focus:ring-[#D41B2C]"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 rounded-lg text-white font-medium text-sm transition bg-[#D41B2C] hover:bg-[#B31824]"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 px-4 rounded-lg text-gray-700 font-medium text-sm transition bg-gray-200 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-gray-600">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(eventData.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Time:</span>{" "}
                      {new Date(
                        `2000-01-01T${eventData.time}`
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Location:</span>{" "}
                      {eventData.location}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Created by:</span>{" "}
                      {eventData.creatorName}
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={handleSignUp}
                disabled={
                  isSignedUp || isPastEvent(eventData.date, eventData.time)
                }
                className={`w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition bg-green-600 hover:bg-green-700 mb-4 ${
                  isSignedUp || isPastEvent(eventData.date, eventData.time)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#D41B2C] hover:bg-[#B31824]"
                }`}
              >
                {isSignedUp
                  ? "Already Signed Up"
                  : isPastEvent(eventData.date, eventData.time)
                  ? "Event Has Passed"
                  : "Sign Up for Event"}
              </button>

              {canManageEvent && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  Edit Event
                </button>
              )}

              {canManageEvent && !isEditing && (
                <button
                  onClick={handleDeleteEvent}
                  className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition bg-red-600 hover:bg-red-700"
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-bold mb-4">Participants</h2>
              <div className="max-h-[600px] overflow-y-auto">
                {eventData.participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#D41B2C] rounded-full flex items-center justify-center text-white font-semibold">
                        {participant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-gray-600">
                          {participant.username}
                        </p>
                      </div>
                    </div>
                    {(canManageEvent ||
                      false) /*session?.user?.id === participant.id*/ && (
                      <button
                        onClick={() =>
                          handleRemoveParticipant(eventData.attendees[index])
                        }
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                        title="Remove participant"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
