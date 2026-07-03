import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, className, centered }: Props) {
  return (
    <div className={cn("mb-10 md:mb-12", centered && "text-center", className)}>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#111827] tracking-tight">{title}</h2>
      {subtitle && (
        <p className={cn("mt-3 text-base text-[#6B7280] leading-relaxed max-w-xl", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
