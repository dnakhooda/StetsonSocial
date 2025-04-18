import { NextResponse } from "next/server";
import { db } from "../../../../../../firebaseConfig";
import { get, ref, remove } from "firebase/database";
import Event from "@/types/event";

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("isAdmin") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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
            "Unauthorized: Only event creators or admins can delete events",
        },
        { status: 403 }
      );
    }

    await remove(eventRef);

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
