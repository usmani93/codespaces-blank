export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  tags: string[];
  votes: number;
  answersCount: number;
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  votes: number;
  isAccepted: boolean;
}