import { useCountUp } from "../hooks/useCountUp";

type StatCounterProps = {
  target: number;
  suffix?: string;
  label: string;
};

export default function StatCounter({ target, suffix = "", label }: StatCounterProps) {
  const { ref, value } = useCountUp<HTMLParagraphElement>(target);

  return (
    <div>
      <p ref={ref} className="font-display text-4xl font-medium text-paper md:text-5xl">
        {value}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-paper/60">{label}</p>
    </div>
  );
}
