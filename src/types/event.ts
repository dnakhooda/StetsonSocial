interface Event {
  id: string;

  creatorId: string;
  creatorName: string;

  title: string;
  description: string;
  location: string;
  imageUrl: string;
  date: string;
  time: string;

  attendees: string[];
}

export default Event;
