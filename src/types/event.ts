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
  isAdminEvent: boolean;
}

export default Event;
