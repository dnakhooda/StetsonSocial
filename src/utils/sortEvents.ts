import Event from "@/types/event";

export default function sortEvents(events: Event[]) {
  return events.sort(
    (a: Event, b: Event) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
