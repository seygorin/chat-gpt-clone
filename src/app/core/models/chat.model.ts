import { Message } from './message.model';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChatPreview = Pick<Chat, 'id' | 'title' | 'updatedAt'>;
export type ChatCreate = Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>;
export type ChatUpdate = Partial<Pick<Chat, 'title' | 'updatedAt'>>;

export function isChat(obj: unknown): obj is Chat {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Chat).id === 'string' &&
    typeof (obj as Chat).title === 'string' &&
    Array.isArray((obj as Chat).messages) &&
    (obj as Chat).createdAt instanceof Date &&
    (obj as Chat).updatedAt instanceof Date
  );
}
