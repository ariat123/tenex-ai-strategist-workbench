type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
  hint?: string;
};

export function TextareaField({
  label,
  value,
  onChange,
  minRows = 4,
  hint,
}: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={minRows}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
