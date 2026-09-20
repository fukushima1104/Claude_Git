/**
 * デザイントークン
 * 色・余白・フォントサイズ・角丸・影は、すべてこのファイルで管理する。
 * Tailwind の theme もこのファイルを読み込んで生成しているため、
 * 値を変えたい場合はここだけを編集すれば全画面に反映される。
 */

/** 配色。括弧内は本文色として使ったときのコントラスト比(WCAG AA = 4.5:1 以上)。 */
export const colors = {
  /** ページの地。純白ではなく、わずかに温かいオフホワイト。 */
  canvas: '#FBF9F6',
  /** カードなどの面。 */
  surface: '#FFFFFF',
  /** 面のうち、一段沈めたいもの(入力欄の背景など)。 */
  sunken: '#F4F1EC',
  /** 罫線。 */
  line: '#E4DED5',
  lineStrong: '#D2C9BC',

  ink: {
    900: '#1C2B2E', // 見出し・本文 (14.8:1)
    700: '#33474B', // 強めの補助 (9.2:1)
    600: '#4F6265', // 補助文言 (6.9:1)
    400: '#7C8C8E', // プレースホルダと飾り罫のみ (3.5:1)。読ませる文字には使わない
  },

  /** 主色。ボタン・リンク・選択状態。 */
  primary: {
    900: '#0D3F3C',
    700: '#15625E', // 主要操作 (6.2:1)
    500: '#2B837D',
    100: '#D4E7E4',
    50: '#E9F3F1',
  },

  /** AI「ナビ」の色。主色と混同しないよう、青みを強くしている。 */
  navi: {
    700: '#2F6580', // ナビの文字 (navi-50 の上で 5.7:1)
    600: '#3E7C9A', // ナビの印・面の色。白地の文字なら 4.6:1
    100: '#DCEAF2',
    50: '#EDF4F8',
  },

  /** 「振り返り待ち」など、急かさずに目を向けてほしいもの。 */
  amber: {
    700: '#8A5A12', // (6.4:1)
    500: '#C18B33',
    100: '#F7E7CB',
    50: '#FDF3E2',
  },

  /** 達成・前進。成長を示す印。 */
  grow: {
    700: '#3F6B2E', // (5.8:1)
    500: '#5E8F49',
    100: '#DDE9D5',
    50: '#EDF4E8',
  },

  /** 録画インジケータ専用。面積を最小限に保ち、枠線や背景には使わない。 */
  rec: '#C0453C',
} as const;

/** 余白。4px を基準とした段階。 */
export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
} as const;

/**
 * フォントサイズ。日本語の可読性を優先し、行間は広め(1.75)。
 * 本文の最小は 15px。14px 以下は補助ラベルのみに使う。
 */
export const fontSize = {
  xs: ['12px', { lineHeight: '1.6' }],
  sm: ['14px', { lineHeight: '1.7' }],
  base: ['15px', { lineHeight: '1.75' }],
  md: ['16px', { lineHeight: '1.75' }],
  lg: ['18px', { lineHeight: '1.7' }],
  xl: ['22px', { lineHeight: '1.6' }],
  '2xl': ['28px', { lineHeight: '1.5' }],
  '3xl': ['36px', { lineHeight: '1.4' }],
} as const;

export const radius = {
  sm: '6px',
  md: '10px', // ボタン
  lg: '16px', // カード
  xl: '20px',
  full: '999px', // タグ
} as const;

/** 影は極薄の一段のみ。要素を浮かせすぎない。 */
export const shadow = {
  card: '0 1px 3px rgba(28, 43, 46, 0.06)',
  raised: '0 4px 16px rgba(28, 43, 46, 0.08)',
  overlay: '0 16px 48px rgba(28, 43, 46, 0.16)',
} as const;

export const fontFamily = {
  sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
  /** 数字を桁揃えしたいところ(日付・時間)で使う。 */
  num: ['Inter', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
} as const;
