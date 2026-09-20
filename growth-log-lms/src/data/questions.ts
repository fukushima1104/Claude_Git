import type { QuestionId } from './types';

/** 3つの質問。セッションはこの順に進む。 */
export const QUESTIONS: {
  id: QuestionId;
  /** ステップ表示に使う短い見出し */
  step: string;
  /** ナビが実際に話す文面 */
  prompt: string;
  /** 入力欄のプレースホルダ */
  placeholder: string;
  /** 回答が短いときにナビが1度だけ返す深掘り */
  followUp: string;
}[] = [
  {
    id: 'learning',
    step: '学び・気づき',
    prompt: '今日の学びのなかで、いちばん心に残ったことは何ですか。',
    placeholder: '思い出したことから、順番はばらばらでも大丈夫です。',
    followUp:
      'もう少しだけ伺わせてください。「そうか」と思えた瞬間は、どんな場面でしたか。',
  },
  {
    id: 'apply',
    step: '仕事への活かし方',
    prompt: 'その学びは、ご自分の仕事のどこで活かせそうですか。',
    placeholder: '担当している仕事や、気になっている場面を思い浮かべてみてください。',
    followUp:
      'ありがとうございます。いま抱えている仕事のなかで、いちばん近いものはどれでしょうか。',
  },
  {
    id: 'action',
    step: '行動目標',
    prompt: 'では、次にやってみることをひとつだけ決めるとしたら何にしますか。',
    placeholder: '小さなことで構いません。明日からできることを。',
    followUp:
      'いいですね。それは、いつごろまでにやってみたいですか。',
  },
];

export const QUESTION_LABEL: Record<QuestionId, string> = {
  learning: '学び・気づき',
  apply: '仕事への活かし方',
  action: '行動目標',
};
