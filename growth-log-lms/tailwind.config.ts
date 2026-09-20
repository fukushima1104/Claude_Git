import type { Config } from 'tailwindcss';
import {
  colors,
  spacing,
  fontSize,
  radius,
  shadow,
  fontFamily,
} from './src/design/tokens';

/**
 * Tailwind のテーマは src/design/tokens.ts を唯一の出どころとする。
 * ここでは「トークンを Tailwind の語彙に割り当てる」だけで、値は持たない。
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: colors.canvas,
        surface: colors.surface,
        sunken: colors.sunken,
        line: { DEFAULT: colors.line, strong: colors.lineStrong },
        ink: colors.ink,
        primary: colors.primary,
        navi: colors.navi,
        amber: colors.amber,
        grow: colors.grow,
        rec: colors.rec,
      },
      spacing,
      fontSize: fontSize as unknown as Record<string, string>,
      borderRadius: radius,
      boxShadow: shadow,
      fontFamily: fontFamily as unknown as Record<string, string[]>,
      letterSpacing: { ja: '0.02em' },
      maxWidth: { content: '1120px' },
    },
  },
  plugins: [],
} satisfies Config;
