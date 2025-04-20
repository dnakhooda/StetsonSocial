export default function isPastEvent(date: string, time: string) {
  const now = new Date();
  const eventDate = new Date(date);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );

  return eventDay < today;
}
