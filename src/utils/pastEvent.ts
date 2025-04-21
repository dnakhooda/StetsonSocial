export default function isPastEvent(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  const eventDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return eventDate < today;
}
