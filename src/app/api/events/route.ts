import { NextResponse } from "next/server";
import { db } from "../../../../firebaseConfig";
import { get, push, ref, set } from "firebase/database";
import Event from "@/types/event";
import isPastEvent from "@/utils/pastEvent";
import { Filter } from "bad-words";

const filter = new Filter();

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
    } = await request.json();

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

    const userRef = ref(db, `users/${creatorId}`);
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnapshot.val();
    const isAdmin = userData.isAdmin;

    if (!isAdmin) {
      const eventsRef = ref(db, "events");
      const eventsSnapshot = await get(eventsRef);

      if (eventsSnapshot.exists()) {
        const events = eventsSnapshot.val() as Record<string, Event>;
        const userFutureEvents = Object.values(events).filter(
          (event) =>
            event.creatorId === creatorId &&
            !isPastEvent(event.date, event.time)
        );

        if (userFutureEvents.length >= 3) {
          return NextResponse.json(
            { error: "You have reached the maximum limit of 3 future events" },
            { status: 403 }
          );
        }
      }
    }

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
      isAdminEvent: isAdmin,
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
