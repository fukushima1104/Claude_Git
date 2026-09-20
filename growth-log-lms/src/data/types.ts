/** 研修・学びの種類。 */
export type LearningKind = 'external' | 'internal' | 'study';

/** 振り返りの進み具合。 */
export type ReflectionStatus =
  /** 受講は登録されたが、まだ振り返っていない */
  | 'awaiting'
  /** 途中まで話して「あとで続ける」を選んだ */
  | 'draft'
  /** サマリーまで確定した */
  | 'done';

/** 行動目標の状態。 */
export type GoalStatus = 'notStarted' | 'inProgress' | 'achieved' | 'revising';

/** 映像の公開範囲。既定は本人のみ。 */
export type Visibility = 'self' | 'manager' | 'team';

/** 3つの質問。順番はこの配列の順で固定。 */
export type QuestionId = 'learning' | 'apply' | 'action';

/** 文字起こしの一片。映像の再生位置と結びつく。 */
export interface TranscriptLine {
  /** 録画開始からの秒数 */
  at: number;
  speaker: 'navi' | 'me';
  text: string;
  /** どの質問に対する発話か */
  question: QuestionId;
  /** ナビが深掘りとして追加した質問かどうか */
  isFollowUp?: boolean;
}

/** 1回の振り返りセッションで得られた3項目の回答。 */
export interface ReflectionAnswers {
  learning: string;
  apply: string;
  action: string;
}

/** 行動目標。セッションから生まれ、後から状態が更新されていく。 */
export interface Goal {
  id: string;
  /** 由来となった記録 */
  recordId: string;
  title: string;
  /** 期限 (YYYY-MM-DD) */
  dueDate: string;
  status: GoalStatus;
  /** 本人が書き足した進捗メモ。新しい順ではなく、書いた順に積む。 */
  updates: { date: string; note: string }[];
}

/** 本人が後から書き足したメモ。 */
export interface LaterNote {
  date: string;
  text: string;
}

/** 1件の学びの記録。研修そのものと、その振り返りをひとまとめに持つ。 */
export interface LearningRecord {
  id: string;
  kind: LearningKind;
  title: string;
  /** 受講日 (YYYY-MM-DD) */
  date: string;
  organizer: string;
  /** 登録時の簡単なメモ */
  memo: string;
  status: ReflectionStatus;
  /** テーマ・スキルのタグ */
  tags: string[];
  /** 振り返り済みの場合のみ */
  answers?: ReflectionAnswers;
  transcript?: TranscriptLine[];
  /** 録画の長さ(秒) */
  durationSec?: number;
  /** 振り返りを行った日 */
  reflectedOn?: string;
  visibility: Visibility;
  laterNotes: LaterNote[];
}

/** 期間をまたいだ自己評価。 */
export interface SelfReview {
  id: string;
  /** 対象期間 */
  from: string;
  to: string;
  label: string;
  /** 達成度。数値ではなく語彙で表す。 */
  attainment: AttainmentLevel;
  grew: string;
  next: string;
  createdOn: string;
}

/** 自己評価の段階。点数ではなく、実感を言葉で選ぶ。 */
export type AttainmentLevel = 'early' | 'starting' | 'feeling' | 'owned';

/** AI「ナビ」からの成長アドバイス。必ず根拠となる記録を伴う。 */
export interface Advice {
  id: string;
  category: 'strength' | 'potential' | 'next';
  headline: string;
  body: string;
  /** 根拠となった記録の ID。透明性のため必須。 */
  evidenceRecordIds: string[];
  /** 根拠となった行動目標の ID */
  evidenceGoalIds?: string[];
}

/** アドバイスへの「役に立った / 違うと思う」。 */
export type AdviceFeedback = 'helpful' | 'off' | null;

/** プライバシー・データ設定。 */
export interface PrivacySettings {
  /** 映像の保存期間(年)。0 は無期限。 */
  retentionYears: number;
  defaultVisibility: Visibility;
  /** 文字起こしだけを残し、映像は保存しない */
  transcriptOnly: boolean;
  /** 振り返りのリマインドを受け取る */
  remindReflection: boolean;
  /** 行動目標の進捗リマインドを受け取る */
  remindGoals: boolean;
}

export interface UserProfile {
  name: string;
  department: string;
  joinedYear: number;
  /** 上長の名前(共有先の表示に使う) */
  managerName: string;
}
