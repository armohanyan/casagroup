import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-xs flex-wrap", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && <ChevronRight size={12} className="text-[#D6D0C8] shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#A8A29E] hover:text-[#c9a96e] transition-colors truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn("truncate", isLast ? "text-[#57534E] font-medium" : "text-[#A8A29E]")}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
