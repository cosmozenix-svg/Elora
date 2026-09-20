import { cn } from '../lib/utils';

interface EloCoinProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
}

export default function EloCoin({ className, size = 'sm', title = "Elo coin" }: EloCoinProps) {
  const sizeMap = {
    xs: {
      wrapper: 'w-3.5 h-3.5',
      inner: 'w-2.5 h-2.5',
      text: 'text-[8px]'
    },
    sm: {
      wrapper: 'w-4 h-4',
      inner: 'w-3 h-3',
      text: 'text-[9.5px]'
    },
    md: {
      wrapper: 'w-5 h-5',
      inner: 'w-3.5 h-3.5',
      text: 'text-[11px]'
    },
    lg: {
      wrapper: 'w-7 h-7',
      inner: 'w-5 h-5',
      text: 'text-[15px]'
    },
    xl: {
      wrapper: 'w-10 h-10',
      inner: 'w-7 h-7',
      text: 'text-[22px]'
    }
  };

  const { wrapper, inner, text } = sizeMap[size];

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0 select-none",
        "bg-gradient-to-b from-[#FFE57F] via-[#FFC107] to-[#B27B00]",
        "border border-[#FFE082]/90",
        "shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.7)]",
        wrapper,
        className
      )}
      style={{ aspectRatio: '1 / 1' }}
      title={title}
      aria-label={title}
    >
      {/* Inner coined ridge */}
      <span
        className={cn(
          "rounded-full flex items-center justify-center",
          "border border-[#996500]/40",
          "bg-gradient-to-tr from-[#E5A100] via-[#FFD54F] to-[#FFF8E1]",
          "shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.25)]",
          inner
        )}
      >
        {/* Embossed Letter 'E' */}
        <span
          className={cn(
            "font-black text-[#503000] dark:text-[#503000] leading-none select-none tracking-tight",
            "drop-shadow-[0_0.5px_0_rgba(255,255,255,0.75)]",
            text
          )}
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          E
        </span>
      </span>
    </span>
  );
}
