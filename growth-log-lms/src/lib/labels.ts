import type {
  AttainmentLevel,
  GoalStatus,
  LearningKind,
  ReflectionStatus,
  Visibility,
} from '@/data/types';

export const KIND_LABEL: Record<LearningKind, string> = {
  external: '外部研修',
  internal: '社内研修',
  study: '勉強会',
};

/** 種類ごとの色。彩度は抑え、分類の手がかりとしてだけ使う。 */
export const KIND_STYLE: Record<LearningKind, string> = {
  external: 'bg-navi-50 text-navi-700 border-navi-100',
  internal: 'bg-primary-50 text-primary-900 border-primary-100',
  study: 'bg-amber-50 text-amber-700 border-amber-100',
};

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  notStarted: '未着手',
  inProgress: '実行中',
  achieved: '達成',
  revising: '見直し',
};

export const GOAL_STATUS_STYLE: Record<GoalStatus, string> = {
  notStarted: 'bg-sunken text-ink-600 border-line',
  inProgress: 'bg-navi-50 text-navi-700 border-navi-100',
  achieved: 'bg-grow-50 text-grow-700 border-grow-100',
  revising: 'bg-amber-50 text-amber-700 border-amber-100',
};

export const REFLECTION_STATUS_LABEL: Record<ReflectionStatus, string> = {
  awaiting: '振り返り待ち',
  draft: '途中まで',
  done: '振り返り済み',
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  self: '自分のみ',
  manager: '上長にも共有',
  team: 'チームにも共有',
};

export const VISIBILITY_DESCRIPTION: Record<Visibility, string> = {
  self: 'この記録を見られるのはあなただけです。',
  manager: 'あなたと、上長が見られます。',
  team: 'あなたと、同じチームのメンバーが見られます。',
};

/** 自己評価の段階。点数ではなく、実感の言葉で選ぶ。 */
export const ATTAINMENT: {
  value: AttainmentLevel;
  label: string;
  hint: string;
}[] = [
  { value: 'early', label: 'まだこれから', hint: '知ってはいるが、やれてはいない' },
  { value: 'starting', label: '進み始めた', hint: '意識すればできる場面がある' },
  { value: 'feeling', label: '手応えあり', hint: '意識しなくてもできることが増えた' },
  { value: 'owned', label: '自分のものになった', hint: '人に教えられる' },
];

export const ATTAINMENT_LABEL: Record<AttainmentLevel, string> = Object.fromEntries(
  ATTAINMENT.map((a) => [a.value, a.label]),
) as Record<AttainmentLevel, string>;

export const ADVICE_CATEGORY_LABEL = {
  strength: '強み',
  potential: '伸びしろ',
  next: '次に学ぶとよいこと',
} as const;
