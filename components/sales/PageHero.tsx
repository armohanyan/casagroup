import Image from "next/image";

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: string;
  image?: string;
  /** Pulls search panel up over the hero image */
  overlap?: boolean;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  image = "/yerevan.png",
  overlap = false,
  action,
  children,
}: PageHeroProps) {
  return (
    <div className="relative">
      <section
        className={
          overlap
            ? "relative overflow-hidden min-h-[min(88vh,820px)] sm:min-h-[min(85vh,780px)] lg:min-h-[min(82vh,860px)]"
            : "relative overflow-hidden min-h-[min(42vh,380px)] sm:min-h-[min(40vh,420px)] lg:min-h-[min(38vh,460px)]"
        }
      >
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 animate-[hero-zoom_20s_ease-out_forwards]"
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand/92 via-brand/58 to-brand/28" />
        {overlap ? (
          <div className="absolute inset-x-0 bottom-0 z-[2] h-28 sm:h-36 bg-gradient-to-t from-[#F6F7FB] from-35% via-[#F6F7FB]/70 to-transparent pointer-events-none" />
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-[2] h-24 sm:h-28 bg-gradient-to-t from-[#F6F7FB] from-40% via-[#F6F7FB]/80 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 pt-header h-full">
          <div
            className={`max-w-[1320px] mx-auto px-4 sm:px-0 flex flex-col justify-center ${
 overlap
 ? "min-h-[min(62vh,580px)] sm:min-h-[min(58vh,540px)] lg:min-h-[min(55vh,600px)] py-12 sm:py-16"
 : "min-h-[min(34vh,300px)] sm:min-h-[min(32vh,340px)] py-10 sm:py-12 pb-16 sm:pb-20"
 }`}
          >
            <h1 className="type-hero text-white max-w-3xl drop-shadow-sm">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 type-body text-white/85 max-w-2xl drop-shadow-sm sm:text-base">
                {subtitle}
              </p>
            ) : null}
            {action ? <div className="mt-6">{action}</div> : null}
          </div>
        </div>
      </section>

      {children ? (
        <div className="relative z-20 -mt-14 sm:-mt-20 mb-4 sm:mb-6">{children}</div>
      ) : null}
    </div>
  );
}
