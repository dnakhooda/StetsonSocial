import { NextResponse } from "next/server";
import { db } from "../../../../../../firebaseConfig";
import { get, ref, update } from "firebase/database";
import Event from "@/types/event";

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await request.json();
    const eventId = params.eventId;

    const eventRef = ref(db, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = snapshot.val() as Event;

    if (!event.attendees.includes(userId)) {
      return NextResponse.json(
        { error: "User is not an attendee of this event" },
        { status: 400 }
      );
    }

    const updatedAttendees = event.attendees.filter((id) => id !== userId);
    await update(eventRef, { attendees: updatedAttendees });

    return NextResponse.json(
      { message: "Successfully removed from event" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from event:", error);
    return NextResponse.json(
      { error: "Failed to remove from event" },
      { status: 500 }
    );
  }
}
