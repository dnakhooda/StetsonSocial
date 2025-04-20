import { NextResponse } from "next/server";
import { get, ref, update } from "firebase/database";
import Event from "@/types/event";
import { db } from "../../../../../../firebaseConfig";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const eventId = pathSegments[pathSegments.indexOf("events") + 1];

    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = snapshot.val() as Event;

    console.log(event);

    if (!event.attendees) {
      event.attendees = [];
    }

    if (event.attendees.includes(userId)) {
      return NextResponse.json(
        { error: "User is already an attendee" },
        { status: 400 }
      );
    }

    const updatedAttendees = [...event.attendees, userId];
    await update(eventRef, { attendees: updatedAttendees });

    return NextResponse.json(
      { message: "Successfully joined event" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }
}
