export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

export function formatTime(timeString: string): string {
  const dummyDate = new Date(`2000-01-01T${timeString}`);

  return dummyDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
