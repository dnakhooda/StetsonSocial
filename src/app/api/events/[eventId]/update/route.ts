import { NextResponse } from "next/server";
import { db } from "../../../../../../firebaseConfig";
import { get, ref, update } from "firebase/database";
import Event from "@/types/event";
import { Filter } from "bad-words";

const filter = new Filter();

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const eventId = pathSegments[pathSegments.indexOf("events") + 1];

    const { searchParams } = url;
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("isAdmin") === "true";
    const { title, description, date, time, location } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (filter.isProfane(title)) {
      return NextResponse.json(
        { error: "Event title contains inappropriate language" },
        { status: 400 }
      );
    }

    if (filter.isProfane(description)) {
      return NextResponse.json(
        { error: "Event description contains inappropriate language" },
        { status: 400 }
      );
    }

    if (filter.isProfane(location)) {
      return NextResponse.json(
        { error: "Event location contains inappropriate language" },
        { status: 400 }
      );
    }

    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = snapshot.val() as Event;

    if (event.creatorId !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Only event creators or admins can update events",
        },
        { status: 403 }
      );
    }

    if (title !== event.title) {
      const eventsRef = ref(db, "events");
      const eventsSnapshot = await get(eventsRef);

      if (eventsSnapshot.exists()) {
        const events = eventsSnapshot.val() as Record<string, Event>;
        const titleExists = Object.entries(events).some(
          ([id, eventData]) => id !== eventId && eventData.title === title
        );

        if (titleExists) {
          return NextResponse.json(
            { error: "An event with this title already exists" },
            { status: 400 }
          );
        }
      }
    }

    await update(eventRef, {
      title,
      description,
      date,
      time,
      location,
    });

    return NextResponse.json(
      { message: "Event updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
