export type AlumniTab = "directory" | "connections";
export type ChatSender = "alumnus" | "student" | "system";

export type AlumniProfile = {
  id: string;
  name: string;
  avatar: string;
  image: string;
  company: string;
  role: string;
  college: string;
  branch: string;
  year: string;
  city: string;
  country: string;
  skills: string[];
  availableFor: string[];
  achievements: string;
  col: string;
};

export type AlumniChatMessage = {
  sender: ChatSender;
  text: string;
  time: string;
};

export type ChatHistories = Record<string, AlumniChatMessage[]>;
