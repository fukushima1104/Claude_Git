import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-base ' +
  'text-ink-900 placeholder:text-ink-400 focus:border-primary-700';

export function Field({
  label,
  hint,
  required,
  children,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="ml-1 text-amber-700">(必須)</span>}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-600">{hint}</p>}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  required,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} required={required} htmlFor={id}>
      <input id={id} className={cn(CONTROL, className)} required={required} {...rest} />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  required,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} required={required} htmlFor={id}>
      <textarea
        id={id}
        className={cn(CONTROL, 'min-h-[120px] resize-y leading-relaxed', className)}
        required={required}
        {...rest}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  children,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className={cn(CONTROL, 'pr-8', className)} {...rest}>
        {children}
      </select>
    </Field>
  );
}

/** 大きめの選択肢。研修の種類や公開範囲など、少数から選ぶとき。 */
export function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  columns = 3,
}: {
  legend: ReactNode;
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-700">{legend}</legend>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                'cursor-pointer rounded-md border px-4 py-3 transition-colors',
                active
                  ? 'border-primary-700 bg-primary-50'
                  : 'border-line bg-surface hover:bg-sunken',
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={String(legend)}
                checked={active}
                onChange={() => onChange(o.value)}
              />
              <span
                className={cn(
                  'block text-base font-medium',
                  active ? 'text-primary-900' : 'text-ink-900',
                )}
              >
                {o.label}
              </span>
              {o.hint && <span className="mt-1 block text-sm text-ink-600">{o.hint}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Checkbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-line-strong text-primary-700 accent-[#15625E]"
      />
      <span>
        <span className="block text-base text-ink-900">{label}</span>
        {description && <span className="block text-sm text-ink-600">{description}</span>}
      </span>
    </label>
  );
}
