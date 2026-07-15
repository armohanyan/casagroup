"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrandSlider } from "@/components/ui/BrandSlider";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";

const inputCls = "field-input font-sans";

function calcMonthly(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

interface MortgageCalculatorProps {
  initialPrice?: number;
  compact?: boolean;
}

export function MortgageCalculator({ initialPrice, compact }: MortgageCalculatorProps = {}) {
  const { t, lang } = useI18n();
  const defaultPrice = initialPrice && initialPrice > 0 ? initialPrice : 50_000_000;
  const priceMin = Math.max(5_000_000, Math.floor((defaultPrice * 0.4) / 1_000_000) * 1_000_000);
  const priceMax = Math.max(
    defaultPrice + 50_000_000,
    Math.ceil((defaultPrice * 2.5) / 1_000_000) * 1_000_000,
  );
  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(20);
  const [rate, setRate] = useState(12);

  const result = useMemo(() => {
    const down = price * (downPct / 100);
    const loan = price - down;
    const monthly = calcMonthly(loan, rate, term);
    const total = monthly * term * 12;
    const interest = total - loan;
    return { down, loan, monthly, total, interest };
  }, [price, downPct, term, rate]);

  const yearsLabel = lang === "hy" ? "տարի" : "years";

  return (
    <div className={`grid grid-cols-1 ${compact ? "gap-6" : "lg:grid-cols-2 gap-10"}`}>
      <div className="space-y-6">
        <div>
          <label className="field-label">{t.calculator.propertyPrice}</label>
          <BrandSlider
            min={priceMin}
            max={priceMax}
            step={1_000_000}
            value={Math.min(priceMax, Math.max(priceMin, price))}
            onChange={setPrice}
            aria-label={t.calculator.propertyPrice}
          />
          <p className="mt-1.5 font-sans tabular-nums text-[#c9a96e]">{formatPrice(price)}</p>
        </div>

        <div>
          <label className="field-label">{t.calculator.downPayment}</label>
          <BrandSlider
            min={0}
            max={50}
            step={5}
            value={downPct}
            onChange={setDownPct}
            aria-label={t.calculator.downPayment}
          />
          <p className="mt-1.5 text-[#1C1917]">
            {downPct}% — {formatPrice(result.down)}
          </p>
        </div>

        <div>
          <label className="field-label">{t.calculator.loanTerm}</label>
          <BrandSlider
            min={5}
            max={30}
            step={1}
            value={term}
            onChange={setTerm}
            aria-label={t.calculator.loanTerm}
          />
          <p className="mt-1.5 text-[#1C1917]">
            {term} {yearsLabel}
          </p>
        </div>

        <div>
          <label className="field-label">{t.calculator.interestRate}</label>
          <input
            type="number"
            className={inputCls}
            value={rate}
            min={0}
            max={30}
            step={0.1}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
      </div>

      <motion.div
        className={`bg-[#F3EFE8] border border-[#E7E0D5] rounded-xl space-y-6 ${compact ? "p-5" : "p-8"}`}
        initial={compact ? false : { opacity: 0, x: 20 }}
        whileInView={compact ? undefined : { opacity: 1, x: 0 }}
        viewport={compact ? undefined : { once: true }}
      >
        <div>
          <p className="text-xs tracking-widest uppercase text-[#A8A29E] mb-2">{t.calculator.monthlyPayment}</p>
          <p className="font-sans font-semibold text-4xl text-[#c9a96e]">
            {formatPrice(Math.round(result.monthly))}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E7E0D5]">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A8A29E] mb-1">{t.calculator.loanAmount}</p>
            <p className="text-sm text-[#1C1917] font-sans tabular-nums">{formatPrice(Math.round(result.loan))}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A8A29E] mb-1">{t.calculator.totalPayment}</p>
            <p className="text-sm text-[#1C1917] font-sans tabular-nums">{formatPrice(Math.round(result.total))}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A8A29E] mb-1">{t.calculator.totalInterest}</p>
            <p className="text-sm text-[#1C1917] font-sans tabular-nums">{formatPrice(Math.round(result.interest))}</p>
          </div>
        </div>

        <p className="text-xs text-[#A8A29E] leading-relaxed">{t.calculator.disclaimer}</p>
      </motion.div>
    </div>
  );
}
