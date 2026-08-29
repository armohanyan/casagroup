import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-6xl mx-auto px-4 sm:px-0", className)}>{children}</div>
  );
}
