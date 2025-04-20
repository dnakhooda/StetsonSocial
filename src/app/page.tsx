"use client";

import Navigation from "@/components/navigation/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Event from "@/types/event";
import Footer from "@/components/footer/footer";
import sortEvents from "@/utils/sortEvents";
import isPastEvent from "@/utils/pastEvent";
import { useUserAuth } from "@/contexts/userAuthContext";
import { eventImages } from "@/utils/eventImages";
import { locations } from "@/utils/locations";

export default function Home() {
  const [activeTab, setActiveTab] = useState("admin");
  const [adminEvents, setAdminEvents] = useState<Event[]>([]);
  const [studentEvents, setStudentEvents] = useState<Event[]>([]);
  const [pastAdminEvents, setPastAdminEvents] = useState<Event[]>([]);
  const [pastStudentEvents, setPastStudentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    location: "",
    imageUrl: null,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
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

      const adminEvents = sortedEvents.filter(
        (event) => !isPastEvent(event.date, event.time) && event.isAdminEvent
      );
      const studentEvents = sortedEvents.filter(
        (event) => !isPastEvent(event.date, event.time) && !event.isAdminEvent
      );
      const pastAdminEvents = sortedEvents.filter(
        (event) => isPastEvent(event.date, event.time) && event.isAdminEvent
      );
      const pastStudentEvents = sortedEvents.filter(
        (event) => isPastEvent(event.date, event.time) && !event.isAdminEvent
      );

      setAdminEvents(adminEvents);
      setStudentEvents(studentEvents);
      setPastAdminEvents(pastAdminEvents);
      setPastStudentEvents(pastStudentEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push("/signin");
      return;
    }

    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    if (eventDateTime < now) {
      alert(
        "Cannot create events in the past. Please select a future date and time."
      );
      return;
    }

    if (!isAdmin) {
      const userFutureEvents = [...adminEvents, ...studentEvents].filter(
        (event) =>
          event.creatorId === user.uid && !isPastEvent(event.date, event.time)
      );

      if (userFutureEvents.length >= 3) {
        alert(
          "You have reached the maximum limit of 3 future events. Please wait until some of your events have passed before creating new ones."
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const eventData = {
        creatorId: user.uid,
        creatorName: user.displayName,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        imageUrl: selectedImage || "/images/krentzman-quad.png",
        date: formData.date,
        time: formData.time,
        attendees: {},
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      await response.json();

      setFormData({
        title: "",
        date: "",
        time: "",
        description: "",
        location: "",
        imageUrl: null,
      });
      fetchEvents();
      setActiveTab("admin");
    } catch (error: unknown) {
      console.error("Error creating event:", error);
      if (error instanceof Error) {
        alert("Failed to create event: " + error.message);
      } else {
        alert("Failed to create event: " + String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = (eventTitle: string) => {
    router.push(`/events/${eventTitle}`);
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
    <div className="min-h-screen bg-white text-black relative overflow-hidden flex flex-col">
      <style jsx>{`
        @font-face {
          font-family: "Big Shoulders Inline";
          src: url("/fonts/BigShouldersInline-VariableFont_opsz,wght.ttf")
            format("truetype-variations");
          font-weight: 100 900;
        }

        .text-shadow-white {
          text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
            1px 1px 0 #fff, 0 0 10px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(0, 0, 0, 0.3);
        }

        .hero-text {
          font-family: "Big Shoulders Inline", sans-serif;
          color: #000000;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .background-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("/images/krentzman-quad.png");
          background-size: cover;
          background-position: center;
          opacity: 0.7;
          filter: brightness(1.2) saturate(1.1);
          pointer-events: none;
          z-index: 0;
        }
        @keyframes swirl {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-swirl {
          background-size: 200% 200%;
          animation: swirl 15s ease infinite;
        }
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
        .northeastern-red {
          color: #d41b2c;
        }
        .northeastern-red-bg {
          background-color: #000000;
        }
        .northeastern-red-border {
          border-color: #d41b2c;
        }
      `}</style>

      <div className="background-image" />

      <Navigation />

      <main className="flex-grow">
        <section className="container mx-auto px-6 py-16 relative z-10">
          <div className="text-center">
            <h2 className="text-6xl font-bold mb-6 text-black animate-bounce font-['Lexend']">
              <span className="text-shadow-white">Discover</span>{" "}
              <span className="text-shadow-white">Events</span>{" "}
              <span className="text-shadow-white">in</span>{" "}
              <span className="text-shadow-white">Stetson</span>{" "}
              <span className="text-shadow-white">East/West!</span>
            </h2>
            <button
              onClick={() => router.push("/learnmore")}
              className="bg-[#D41B2C] text-white font-bold py-3 px-8 rounded-full transition hover:bg-[#B31824] mt-8"
            >
              Learn More
            </button>
          </div>
        </section>

        <section className="container mx-auto px-6 py-8 relative z-20">
          <div className="bg-white rounded-lg p-6 shadow-lg relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black via-black to-[#D41B2C] p-[2px]">
              <div className="bg-white rounded-lg h-full w-full"></div>
            </div>
            <div className="relative bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-black mr-4">
                  {activeTab === "admin"
                    ? "Admin Events"
                    : activeTab === "student"
                    ? "Student Events"
                    : activeTab === "pastAdmin"
                    ? "Past Admin Events"
                    : activeTab === "pastStudent"
                    ? "Past Student Events"
                    : "Event Creator"}
                </h2>
                <div className="space-x-4">
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`px-4 py-2 rounded-lg transition border-2 ${
                      activeTab === "admin"
                        ? "bg-[#D41B2C] text-white"
                        : "text-black hover:bg-[#D41B2C] hover:text-white"
                    } border-[#D41B2C] font-['Lexend']`}
                  >
                    Admin Events
                  </button>
                  <button
                    onClick={() => setActiveTab("student")}
                    className={`px-4 py-2 rounded-lg transition border-2 ${
                      activeTab === "student"
                        ? "bg-[#D41B2C] text-white"
                        : "text-black hover:bg-[#D41B2C] hover:text-white"
                    } border-[#D41B2C] font-['Lexend']`}
                  >
                    Student Events
                  </button>
                  <button
                    onClick={() => setActiveTab("pastAdmin")}
                    className={`px-4 py-2 rounded-lg transition border-2 ${
                      activeTab === "pastAdmin"
                        ? "bg-[#D41B2C] text-white"
                        : "text-black hover:bg-[#D41B2C] hover:text-white"
                    } border-[#D41B2C] font-['Lexend']`}
                  >
                    Past Admin
                  </button>
                  <button
                    onClick={() => setActiveTab("pastStudent")}
                    className={`px-4 py-2 rounded-lg transition border-2 ${
                      activeTab === "pastStudent"
                        ? "bg-[#D41B2C] text-white"
                        : "text-black hover:bg-[#D41B2C] hover:text-white"
                    } border-[#D41B2C] font-['Lexend']`}
                  >
                    Past Student
                  </button>
                  <button
                    onClick={() => setActiveTab("create")}
                    className={`px-4 py-2 rounded-lg transition border-2 ${
                      activeTab === "create"
                        ? "bg-[#D41B2C] text-white"
                        : "text-black hover:bg-[#D41B2C] hover:text-white"
                    } border-[#D41B2C] font-['Lexend']`}
                  >
                    Create Event
                  </button>
                </div>
              </div>

              {activeTab === "admin" && (
                <div>
                  {adminEvents.length === 0 ? (
                    <div className="text-center text-black">
                      <p className="text-lg font-semibold font-['Lexend']">
                        No admin events to display
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adminEvents.slice(0, 3).map((event) => (
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
                                  {new Date(
                                    `2000-01-01T${event.time}`
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-600 mb-2">
                                Location: {event.location}
                              </p>
                              <p className="text-gray-700 mb-4">
                                {event.description}
                              </p>
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
                      {adminEvents.length > 3 && (
                        <div className="text-center mt-8">
                          <button
                            onClick={() => router.push("/admin-events")}
                            className="bg-[#D41B2C] hover:bg-[#B31824] text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105"
                          >
                            See More Admin Events
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "student" && (
                <div>
                  {studentEvents.length === 0 ? (
                    <div className="text-center text-black">
                      <p className="text-lg font-semibold font-['Lexend']">
                        No student events to display
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentEvents.slice(0, 3).map((event) => (
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
                                  {new Date(
                                    `2000-01-01T${event.time}`
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-600 mb-2">
                                Location: {event.location}
                              </p>
                              <p className="text-gray-700 mb-4">
                                {event.description}
                              </p>
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
                      {studentEvents.length > 3 && (
                        <div className="text-center mt-8">
                          <button
                            onClick={() => router.push("/student-events")}
                            className="bg-[#D41B2C] hover:bg-[#B31824] text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105"
                          >
                            See More Student Events
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "pastAdmin" && (
                <div>
                  {pastAdminEvents.length === 0 ? (
                    <div className="text-center text-black">
                      <p className="text-lg font-semibold font-['Lexend']">
                        No past admin events to display
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastAdminEvents.slice(0, 3).map((event) => (
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
                                  {new Date(
                                    `2000-01-01T${event.time}`
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-600 mb-2">
                                Location: {event.location}
                              </p>
                              <p className="text-gray-700 mb-4">
                                {event.description}
                              </p>
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
                      {pastAdminEvents.length > 3 && (
                        <div className="text-center mt-8">
                          <button
                            onClick={() => router.push("/past-admin-events")}
                            className="bg-[#D41B2C] hover:bg-[#B31824] text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105"
                          >
                            See All Past Admin Events
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "pastStudent" && (
                <div>
                  {pastStudentEvents.length === 0 ? (
                    <div className="text-center text-black">
                      <p className="text-lg font-semibold font-['Lexend']">
                        No past student events to display
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastStudentEvents.slice(0, 3).map((event) => (
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
                                  {new Date(
                                    `2000-01-01T${event.time}`
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-600 mb-2">
                                Location: {event.location}
                              </p>
                              <p className="text-gray-700 mb-4">
                                {event.description}
                              </p>
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
                      {pastStudentEvents.length > 3 && (
                        <div className="text-center mt-8">
                          <button
                            onClick={() => router.push("/past-student-events")}
                            className="bg-[#D41B2C] hover:bg-[#B31824] text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105"
                          >
                            See All Past Student Events
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "create" && (
                <div className="max-w-md mx-auto">
                  <form className="space-y-4" onSubmit={handleCreateEvent}>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Event Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Location
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            location: value,
                          });
                          setShowCustomLocation(value === "Other (Specify)");
                        }}
                        className="w-full px-4 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                        required
                      >
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                      {showCustomLocation && (
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(e) => {
                            setCustomLocation(e.target.value);
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            });
                          }}
                          placeholder="Enter custom location"
                          className="w-full px-4 py-2 mt-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:border-[#D41B2C] text-black"
                        rows={4}
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Event Image
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {eventImages.map((image) => (
                          <div
                            key={image.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                              selectedImage === image.url
                                ? "border-[#D41B2C]"
                                : "border-transparent"
                            }`}
                            onClick={() => setSelectedImage(image.url)}
                          >
                            <Image
                              src={image.url}
                              alt={image.label}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                              <p className="text-white text-sm">
                                {image.label}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-[#D41B2C] text-white font-bold py-2 px-4 rounded-lg transition hover:bg-[#B31824] ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? "Creating Event..." : "Create Event"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
