import { cn } from "@/lib/format";

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  hint?: string;
  placeholder?: string;
  textareaClassName?: string;
};

export function TextareaField({
  label,
  value,
  onChange,
  minRows = 4,
  hint,
  placeholder,
  textareaClassName,
}: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={minRows}
        placeholder={placeholder}
        className={cn(
          "w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
          textareaClassName,
        )}
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
