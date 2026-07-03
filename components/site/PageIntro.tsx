import { Container } from "./Container";

interface Props {
  title: string;
  subtitle?: string;
}

export function PageIntro({ title, subtitle }: Props) {
  return (
    <div className="pt-header bg-white border-b border-[#E5E7EB]">
      <Container className="py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#111827] tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-base text-[#6B7280] max-w-2xl leading-relaxed">{subtitle}</p>}
      </Container>
    </div>
  );
}
