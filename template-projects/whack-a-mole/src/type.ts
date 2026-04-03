export type Question = {
  groupId: number;
  question: string;
  questionImage?: string,
  answerText?: string;
  answerImage?: string;
};

export type Answer = {
  groupId: number;
  text?: string;
  image?: string;
};

export type typeGame = 'all' | 'onlyText' | 'onlyImage';

export type AnswerPool = {
  all: Answer[];
  onlyText: string[];
  onlyImage: string[];
  type: typeGame;
}

export type RoundAnswer = Answer & {
  correct: boolean;
};

declare global {
  interface Window {
    APP_DATA: Question[]; // 👈 tạm thời dùng any
  }
}