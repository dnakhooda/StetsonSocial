interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  imageUrl: string | null;
  creatorName: string;
}

export default Event;