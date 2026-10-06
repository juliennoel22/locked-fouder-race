"use client";

interface QuizOption {
  id: string;
  label: string;
}

interface QuizChoiceStepProps {
  title: string;
  options: QuizOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function QuizChoiceStep({
  title,
  options,
  selectedValue,
  onSelect,
}: QuizChoiceStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-black">{title}</h2>
      <div className="space-y-2.5 pt-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`w-full p-4 rounded-xl border text-left font-medium transition active:scale-[0.99] cursor-pointer ${
              selectedValue === opt.id
                ? "border-black bg-black text-white font-semibold"
                : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
