/** Google Analytics 4 measurement ID (gtag). */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-6HKFNVP031";

/** Track in production only so local dev traffic does not pollute analytics. */
export const isGoogleAnalyticsEnabled =
  process.env.NODE_ENV === "production" && Boolean(GA_MEASUREMENT_ID);
