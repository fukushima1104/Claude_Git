/**
 * 「ナビ」のふるまい。
 * 実物では LLM が担う部分を、プロトタイプではルールで再現している。
 * 判断基準をここに集約しておき、後で実際の API 呼び出しに差し替えられるようにする。
 */
import type { QuestionId, ReflectionAnswers, LearningRecord } from '@/data/types';

/** これより短い回答には、ナビが一度だけ深掘りの質問を返す。 */
export const FOLLOW_UP_THRESHOLD = 40;

export function needsFollowUp(answer: string): boolean {
  return answer.trim().length > 0 && answer.trim().length < FOLLOW_UP_THRESHOLD;
}

/**
 * 深掘りは1問につき1回まで。2回目は促さず、先に進める言葉を返す。
 * カメラの前で問い詰められている感じにしないための制約。
 */
export function naviClosingLine(answerLength: number): string {
  return answerLength < FOLLOW_UP_THRESHOLD
    ? 'ありがとうございます。いまの言葉で十分です。次に進みましょう。'
    : 'ありがとうございます。よく言葉にしてくださいました。';
}

/**
 * 回答を、サマリー用に整える。
 * 実物では要約するが、ここでは「本人の言葉を削らない」方針に合わせ、
 * 文の重複だけを取り除いて先頭2文に絞る。
 */
export function summarize(text: string): string {
  const sentences = text
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = sentences.filter((s, i) => sentences.indexOf(s) === i);
  return unique.slice(0, 2).join('');
}

export function summarizeAnswers(answers: ReflectionAnswers): ReflectionAnswers {
  return {
    learning: summarize(answers.learning),
    apply: summarize(answers.apply),
    action: summarize(answers.action),
  };
}

/**
 * 回答文からテーマのタグを拾う。
 * 実物では分類モデルが担う。ここでは語の出現で判定する。
 */
const TAG_RULES: { tag: string; words: string[] }[] = [
  { tag: '対話', words: ['聞く', '質問', '沈黙', '会話', '面談', '発言'] },
  { tag: '提案力', words: ['提案', '課題設定', 'お客様', '顧客'] },
  { tag: 'データ活用', words: ['データ', '数字', '分析', '集計'] },
  { tag: '伝え方', words: ['伝え', '結論', '資料', 'スライド', '説明'] },
  { tag: '育成', words: ['後輩', '指導', '育て', '教え'] },
  { tag: '業務改善', words: ['効率', '手作業', '見直し', '自動化'] },
  { tag: '思考法', words: ['仮説', '考え方', '整理', '論理'] },
];

export function suggestTags(answers: ReflectionAnswers): string[] {
  const joined = `${answers.learning}${answers.apply}${answers.action}`;
  return TAG_RULES.filter((r) => r.words.some((w) => joined.includes(w))).map(
    (r) => r.tag,
  );
}

/** 期限の初期値。行動目標は「近すぎず遠すぎない」3週間後を既定にする。 */
export function defaultDueDate(from: string): string {
  const d = new Date(`${from}T00:00:00`);
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

/** 記録の一覧から、同じ気づきが繰り返されているテーマを拾う。 */
export function recurringThemes(records: LearningRecord[]): string[] {
  const counts = new Map<string, number>();
  records
    .filter((r) => r.status === 'done')
    .forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return Array.from(counts)
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

export const QUESTION_ORDER: QuestionId[] = ['learning', 'apply', 'action'];
