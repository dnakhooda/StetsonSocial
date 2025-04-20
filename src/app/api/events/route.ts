import { NextResponse } from "next/server";
import { db } from "../../../../firebaseConfig";
import { get, push, ref, set } from "firebase/database";
import Event from "@/types/event";

export async function GET() {
  try {
    const eventsRef = ref(db, "events");
    const snapshot = await get(eventsRef);

    if (snapshot.exists()) {
      const events = snapshot.val() as Record<string, Event>;
      const eventsArray = Object.entries(events).map(([id, data]) => ({
        ...data,
        id,
      }));
      return NextResponse.json(eventsArray);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      attendees,
      creatorId,
      creatorName,
      title,
      description,
      date,
      time,
      location,
      imageUrl,
      isAdminEvent,
    } = await request.json();

    const eventsRef = ref(db, "events");
    const eventsSnapshot = await get(eventsRef);

    if (eventsSnapshot.exists()) {
      const events = eventsSnapshot.val() as Record<string, Event>;
      const titleExists = Object.values(events).some(
        (eventData) => eventData.title === title
      );

      if (titleExists) {
        return NextResponse.json(
          { error: "An event with this title already exists" },
          { status: 400 }
        );
      }
    }

    const eventRef = ref(db, "events");
    const newEventRef = push(eventRef);
    await set(newEventRef, {
      creatorId,
      creatorName,
      title,
      description,
      location,
      imageUrl,
      date,
      time,
      attendees,
      isAdminEvent: isAdminEvent || false,
    });

    return NextResponse.json(
      { message: "Event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
