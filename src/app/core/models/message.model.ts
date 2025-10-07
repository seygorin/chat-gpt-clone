export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export type MessageCreate = Omit<Message, 'id' | 'timestamp'>;
export type MessageUpdate = Partial<Pick<Message, 'content' | 'isTyping'>>;

export function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Message).id === 'string' &&
    typeof (obj as Message).content === 'string' &&
    ['user', 'assistant'].includes((obj as Message).role) &&
    (obj as Message).timestamp instanceof Date
  );
}
