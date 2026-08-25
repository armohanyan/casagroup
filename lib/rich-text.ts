/** Detect stored HTML so legacy plain-text descriptions keep working. */
export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][a-z0-9]*\b[^>]*>/i.test(value);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert legacy plain text (newlines) into HTML without changing meaning. */
export function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  if (!looksLikeHtml(html)) return html;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[2-4]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/?(ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isRichTextEmpty(html: string): boolean {
  return !htmlToPlainText(html).trim();
}

const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "A", "H2", "H3", "H4"]);

function sanitizeWithDom(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as Element;
    const tag = el.tagName.toUpperCase();
    const children = Array.from(el.childNodes).map(walk).join("");

    if (!ALLOWED_TAGS.has(tag)) return children;
    if (tag === "BR") return "<br>";

    if (tag === "A") {
      const raw = (el.getAttribute("href") ?? "").trim();
      const href =
        /^https?:\/\//i.test(raw) || raw.startsWith("/") || raw.startsWith("#") || raw.startsWith("mailto:")
          ? raw
          : "";
      if (!href) return children;
      return `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${children}</a>`;
    }

    const lower = tag.toLowerCase();
    return `<${lower}>${children}</${lower}>`;
  };

  return Array.from(doc.body.childNodes).map(walk).join("");
}

/** Strip disallowed tags/attrs. Safe for admin-authored project copy. */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  if (!looksLikeHtml(html)) return html;

  if (typeof DOMParser !== "undefined") {
    return sanitizeWithDom(html);
  }

  // SSR fallback: drop obviously dangerous tags; full sanitize runs in the browser.
  return html
    .replace(/<\/?(script|style|iframe|object|embed|form|input|button|textarea|link|meta)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/** HTML suitable for rendering: sanitize HTML, or leave plain text alone. */
export function prepareRichTextForDisplay(value: string): { mode: "html" | "plain"; content: string } {
  const trimmed = value.trim();
  if (!trimmed) return { mode: "plain", content: "" };
  if (looksLikeHtml(trimmed)) {
    return { mode: "html", content: sanitizeRichHtml(trimmed) };
  }
  return { mode: "plain", content: trimmed };
}

/** Normalize editor value for storage (empty → "", plain stays plain until edited as HTML). */
export function normalizeEditorHtml(html: string): string {
  const sanitized = sanitizeRichHtml(html);
  return isRichTextEmpty(sanitized) ? "" : sanitized;
}
