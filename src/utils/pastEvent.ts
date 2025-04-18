export default function isPastEvent(date: string, time: string) {
  const now = new Date();
  const eventDateTime = new Date(`${date}T${time}`);
  return eventDateTime < now;
}
