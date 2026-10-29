/**
 * ═══════════════════════════════════════════════════════════
 *  TEMPLATES.JS — Bộ render: config → HTML
 *  Giao diện "Bàn Đặt Lịch": màn hình chia đôi.
 *  - .desk  : "bàn lễ tân" — máy tính là ô đỏ gạch ghim bên trái (ảnh đổi theo
 *             phần đang xem, lật qua mành sáo + tấm lịch trống); điện thoại là
 *             dải đỏ dính trên cùng, bấm "Lịch trống" mở ra mục lục + lịch.
 *  - .sec   : các phần nội dung cuộn ở cột phải.
 *  - Hero   : ảnh MC hiện ra sau 8 thanh mành sáo lật mở.
 * ═══════════════════════════════════════════════════════════
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Thư mục gốc của dự án (để kiểm tra file ảnh có thật hay không)
const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Ảnh GIF 1×1 trong suốt: dùng cho <source> để trình duyệt KHÔNG tải ảnh lớn ở màn hình không hiện nó
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Số thanh mành sáo
const SLATS = 8;

// ─── ICONS (SVG inline, nét tròn mảnh) ──────────────────
const ICONS = {
  wedding: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="m10.5 4.5 1.5-1.5 1.5 1.5L12 6.5z"/></svg>`,
  corporate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M3 12.5h18"/></svg>`,
  event: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="2.5"/></svg>`,
  ceremony: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V9.5L12 4l8 5.5V21M9.5 21v-5.5h5V21M3 21h18"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-2.5 5 2.5-1.5-7"/></svg>`,
  bilingual: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.070 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  zalo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor"><path d="M12.5 6C9.46 6 7 8.46 7 11.5v25C7 39.54 9.46 42 12.5 42h23c3.04 0 5.5-2.46 5.5-5.5v-25C41 8.46 38.54 6 35.5 6h-23zm2.14 11h18.72c.87 0 1.34 1.01.78 1.67L22.97 31.5h8.87c.74 0 1.16.83.71 1.39-.15.18-.37.29-.61.29H13.36c-.87 0-1.34-1.01-.78-1.67L23.75 18.7h-9.1a.82.82 0 0 1-.72-.43.81.81 0 0 1 .71-1.27z"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>`,
  arrowDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>`,
  location: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>`,
};

// ─── TIỆN ÍCH ──────────────────────────────────────────

/** Escape HTML để chống XSS */
export function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Kiểm tra giá trị có phải placeholder [IN_HOA] không */
export function isPlaceholder(val) {
  if (typeof val !== "string") return false;
  return /\[[A-Z0-9_]+\]/.test(val);
}

/** Trả SVG icon inline (trang trí → aria-hidden) */
export function icon(name, cls = "") {
  const svg = ICONS[name];
  if (!svg) return `<!-- icon "${name}" không tìm thấy -->`;
  const clsAttr = cls ? ` class="${esc(cls)}"` : "";
  return svg.replace("<svg ", `<svg${clsAttr} aria-hidden="true" focusable="false" `);
}

/**
 * Tạo thẻ ảnh: <picture> khi có ảnh mobile riêng, lazy-load, width/height, alt.
 * Ảnh lỗi sẽ tự ẩn (onerror) để lộ khung thay thế .ph ngay sau nó.
 * `sources` = các <source> thêm (VD ảnh trống cho màn hình không hiện ảnh này).
 */
export function media({ src, alt = "", cls = "", width, height, lazy = true, priority = false, mobileSrc, mobileWidth, mobileHeight, sources = [], style = "" }) {
  const loadAttr = priority ? ` fetchpriority="high"` : lazy ? ` loading="lazy"` : "";
  const imgCls = cls ? ` class="${esc(cls)}"` : "";
  const styleAttr = style ? ` style="${esc(style)}"` : "";
  const size = (w, h) => `${w ? ` width="${w}"` : ""}${h ? ` height="${h}"` : ""}`;
  // Ảnh lỗi → ẩn ảnh và bật khung thay thế .ph nằm ngay sau (<img> hoặc <picture>)
  const onError = `this.hidden=true;var n=(this.parentNode.tagName==='PICTURE'?this.parentNode:this).nextElementSibling;if(n)n.classList.add('ph--on')`;
  const img = `<img src="${esc(src)}" alt="${esc(alt)}"${imgCls}${size(width, height)}${styleAttr}${loadAttr} decoding="async" onerror="${onError}">`;

  const extra = sources.map((s) => `<source media="${esc(s.media)}" srcset="${esc(s.srcset)}">`);
  if (mobileSrc) extra.push(`<source media="(max-width: 767px)" srcset="${esc(mobileSrc)}"${size(mobileWidth, mobileHeight)}>`);
  if (!extra.length) return img;
  return `<picture class="contents">
  ${extra.join("\n  ")}
  ${img}
</picture>`;
}

/** File (đường dẫn dạng public/...) có thật trong dự án không. Link http(s) coi như có. */
function fileExists(src) {
  if (!src || typeof src !== "string") return false;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return true;
  try {
    return existsSync(join(ROOT, src));
  } catch {
    return false;
  }
}

/** Bản ảnh cho điện thoại cùng tên, thêm đuôi -m: service-01.webp → service-01-m.webp */
function mobileVariant(src) {
  return typeof src === "string" ? src.replace(/(\.[a-z0-9]+)$/i, "-m$1") : "";
}

/**
 * Khung thay thế khi chưa có ảnh: nền kẻ sọc ngang như mành sáo khép + nhãn.
 * `missing` = đường dẫn ảnh chưa có → khung hiện luôn, và build vẫn liệt kê được file thiếu.
 */
function placeholder(label, cls = "", missing = "", iconName = "image") {
  const on = missing ? " ph--on" : "";
  const data = missing ? ` data-missing="${esc(missing)}"` : "";
  return `<span class="ph ${cls}${on}"${data} aria-hidden="true">${icon(iconName, "ph__icon")}${label ? `<span class="ph__label">${esc(label)}</span>` : ""}</span>`;
}

/**
 * Ảnh + khung thay thế: chỉ chèn <img> khi file thật sự tồn tại (tránh lỗi 404).
 * Không khai báo mobileSrc mà có sẵn file "-m" bên cạnh → điện thoại tự dùng bản nhẹ đó.
 */
function pic(opts, label = "", phCls = "", iconName = "image") {
  if (opts.mobileSrc === undefined && fileExists(mobileVariant(opts.src))) {
    opts = { ...opts, mobileSrc: mobileVariant(opts.src) };
  }
  const hasMain = fileExists(opts.src);
  const hasMobile = fileExists(opts.mobileSrc);
  if (!hasMain && !hasMobile) {
    return placeholder(label, phCls, [opts.src, opts.mobileSrc].filter(Boolean).join(" "), iconName);
  }
  const src = hasMain ? opts.src : opts.mobileSrc;
  const mobileSrc = hasMain && hasMobile && opts.mobileSrc !== opts.src ? opts.mobileSrc : "";
  return media({ ...opts, src, mobileSrc }) + placeholder(label, phCls, "", iconName);
}

/** Thuộc tính href (+ target/rel nếu là link ngoài) */
function linkAttrs(href) {
  const external = /^https?:\/\//.test(href);
  return `href="${esc(href)}"${external ? ` target="_blank" rel="noopener noreferrer"` : ""}`;
}

/** Xuống dòng \n trong config → <br> */
function lines(text) {
  return esc(text || "").replace(/\n/g, "<br>");
}

/** Tiêu đề 2 dòng: dòng sau in nghiêng màu đỏ gạch ("Khoảnh Khắc Đáng Nhớ / <em>Bắt Đầu Từ Sân Khấu</em>") */
function titleLines(text) {
  const parts = String(text || "").split("\n");
  if (parts.length < 2) return esc(parts[0]);
  return `${esc(parts[0])}<br><em>${parts.slice(1).map(esc).join("<br>")}</em>`;
}

/** Số mục hiện sẵn trên điện thoại (mobileVisible), mặc định `fallback` */
function visibleCount(n, fallback) {
  const v = Number(n);
  return Number.isFinite(v) && v >= 1 ? Math.floor(v) : fallback;
}

/** 7 → "07" */
function pad(n) {
  return String(n).padStart(2, "0");
}

/** Chữ lồng: "Nguyễn Minh Tuấn" → "NT"; còn placeholder → "MC" */
function monogram(name) {
  if (!name || isPlaceholder(name)) return "MC";
  const words = name.trim().split(/\s+/);
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** "2026-11-14" → "14/11/2026" (sai định dạng → bỏ qua) */
function viDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** So khớp tên dịch vụ với loại sự kiện trong phiếu: chỉ chọn sẵn khi khớp đúng MỘT loại */
function matchEventType(title, types) {
  const norm = (s) => String(s || "").toLowerCase().replace(/^mc\s+/, "").trim();
  const t = norm(title);
  if (!t) return "";
  const exact = types.filter((x) => norm(x) === t);
  if (exact.length === 1) return exact[0];
  const near = types.filter((x) => norm(x).includes(t) || t.includes(norm(x)));
  return near.length === 1 ? near[0] : "";
}

// ─── HELPERS ────────────────────────────────────────────

/** Tạo các link tel/zalo/mailto/mạng xã hội — nếu còn placeholder thì trỏ về #contact */
export function createHelpers(config) {
  const c = config.contact || {};

  function safeLink(value, prefix = "") {
    if (!value || isPlaceholder(value)) return "#contact";
    if (prefix === "tel:") return `tel:${value.replace(/[^\d+]/g, "")}`;
    if (prefix === "mailto:") return `mailto:${value}`;
    if (prefix === "zalo:") return /^https?:\/\//.test(value) ? value : `https://zalo.me/${value.replace(/[^\d]/g, "")}`;
    return value;
  }

  const hasPhone = c.phone && !isPlaceholder(c.phone);
  const hasEmail = c.email && !isPlaceholder(c.email);

  return {
    phoneLink: safeLink(c.phone, "tel:"),
    phoneDisplay: hasPhone ? c.phone : "Đang cập nhật",
    hasPhone,
    zaloLink: safeLink(c.zalo, "zalo:"),
    emailLink: safeLink(c.email, "mailto:"),
    emailDisplay: hasEmail ? c.email : "Đang cập nhật",
    emailRaw: hasEmail ? c.email : "",
    facebookLink: safeLink(c.facebook),
    youtubeLink: safeLink(c.youtube),
    ctaLink: safeLink(config.header?.ctaButton?.href || c.zalo, "zalo:"),
    heroCtaLink: safeLink(config.hero?.ctaPrimary?.href || c.zalo, "zalo:"),
    floatingLink: safeLink(config.floatingButton?.href || c.zalo, "zalo:"),
  };
}

// ─── RENDERERS ──────────────────────────────────────────

export function createRenderers(config) {
  const h = createHelpers(config);
  const ui = {
    showMore: "Xem thêm",
    showLess: "Thu gọn",
    skipLink: "Bỏ qua đến nội dung chính",
    closeLabel: "Đóng",
    prevLabel: "Ảnh trước",
    nextLabel: "Ảnh sau",
    videoMissing: "Video đang được cập nhật — liên hệ để xem trọn bộ showreel.",
    ...(config.ui || {}),
  };
  const brandName = config.brand?.name || "";
  const bk = config.booking || {};
  const hero = config.hero || {};
  const heroDesktop = hero.image?.desktop || hero.backgroundDesktop || "";
  const heroMobile = hero.image?.mobile || hero.backgroundMobile || "";
  const heroPos = hero.imagePosition || {};

  // ── Danh sách các phần THỰC SỰ hiện trên trang (phần trống bị bỏ qua), theo thứ tự hiển thị.
  //    Thứ tự riêng của giao diện này: Sổ khách đặt ngay sau Giới thiệu.
  const vid = config.videos || {};
  const gal = config.gallery?.items || [];
  const hasFeatured = Boolean(vid.featured && (vid.featured.title || vid.featured.thumbnail || vid.featured.videoUrl));
  const defs = [
    ["hero", config.brand?.tagline || "Trang đầu", true],
    ["about", "Giới thiệu", true],
    ["testimonials", "Sổ khách", (config.testimonials?.items || []).length > 0],
    ["services", "Dịch vụ", (config.services?.items || []).length > 0],
    ["videos", "Thước phim", hasFeatured || (vid.items || []).length > 0],
    ["gallery", "Khoảnh khắc", gal.length > 0],
    ["partners", "Đối tác", (config.partners?.items || []).length > 0],
    ["faq", "Hỏi đáp", (config.faq?.items || []).length > 0],
    ["contact", "Đặt lịch", true],
  ];
  // Ảnh tự chọn cho ô trái khi booking.paneImages để trống
  let galCursor = 0;
  const nextGal = () => gal.length ? gal[galCursor++ % gal.length].src : "";
  const autoPane = {
    hero: heroDesktop,
    about: config.about?.portrait,
    services: config.services?.items?.[0]?.image,
    videos: vid.featured?.thumbnail,
  };
  const secs = defs
    .filter(([, , show]) => show)
    .map(([id, fallback], i) => ({
      id,
      no: pad(i),
      label: (id !== "hero" && config[id]?.sectionLabel) || fallback,
      pane: (bk.paneImages || {})[id] || autoPane[id] || nextGal(),
    }));
  const secOf = (id) => secs.find((s) => s.id === id) || { id, no: "00", label: "" };
  const total = pad(secs.length - 1);

  /** Đầu mỗi phần: số thứ tự + tên phần trên đường kẻ, tiêu đề serif, lời dẫn */
  function secHead(sec, id, fallbackHeading = "", extra = "") {
    const s = secOf(id);
    return `<header class="sec-head">
        <p class="sec-head__meta"><span class="sec-head__no">${s.no}</span><span class="sec-head__label">${esc(s.label)}</span></p>
        <h2 id="${id}-title" class="sec-head__title">${titleLines(sec.heading || fallbackHeading)}</h2>
        ${sec.subheading ? `<p class="sec-head__lede">${esc(sec.subheading)}</p>` : ""}
        ${extra}
      </header>`;
  }

  /** Nút "Xem thêm (N)" cho danh sách thu gọn (ẩn khi không có JS; `wide` = vẫn hiện từ 1024px) */
  function moreButton(listId, extra, label = "", wide = false) {
    if (extra <= 0 && !label) return "";
    const more = label || `${ui.showMore} (${extra})`;
    return `<button type="button" class="more${wide ? " more--wide" : ""}" data-more aria-controls="${listId}" aria-expanded="false" data-label-more="${esc(more)}" data-label-less="${esc(ui.showLess)}">
          <span data-more-text>${esc(more)}</span>${icon("chevronDown", "more__icon")}
        </button>`;
  }

  /** Thuộc tính mở video: chưa có link → hộp thoại báo "đang cập nhật" thay vì phát rỗng */
  function videoAttrs(url, title) {
    const data = url && !isPlaceholder(url) ? `data-video="${esc(url)}"` : `data-video-missing`;
    return `${data} data-title="${esc(title || "")}" aria-haspopup="dialog" aria-controls="player"`;
  }

  /** 8 thanh mành sáo (trang trí) */
  function blinds(cls = "") {
    const slats = Array.from({ length: SLATS }, (_, i) => `<span class="blinds__slat" style="--i:${i}"></span>`).join("");
    return `<span class="blinds ${cls}" data-blinds aria-hidden="true">${slats}</span>`;
  }

  return {
    // ─── SEO HEAD ─────────────────────────────────────
    seoHead() {
      const seo = config.seo || {};
      const siteUrl = seo.url && !isPlaceholder(seo.url) ? seo.url.replace(/\/?$/, "/") : "";
      // og:image cần URL tuyệt đối — chỉ ghép được khi đã có seo.url
      const ogImage = siteUrl ? siteUrl + (seo.ogImage || "") : seo.ogImage || "";
      // Báo trước ảnh lớn của màn hình đầu đúng theo kích thước màn hình (ảnh LCP)
      const preloadMobile = fileExists(heroMobile) ? `<link rel="preload" as="image" href="${esc(heroMobile)}" media="(max-width: 767px)" fetchpriority="high">` : "";
      const preloadDesk = fileExists(heroDesktop) ? `<link rel="preload" as="image" href="${esc(heroDesktop)}" media="(min-width: 768px)" fetchpriority="high">` : "";
      return `<title>${esc(seo.title || "MC Portfolio")}</title>
    <meta name="description" content="${esc(seo.description || "")}">
    <meta name="keywords" content="${esc(seo.keywords || "")}">
    ${siteUrl ? `<link rel="canonical" href="${esc(siteUrl)}">\n    <meta property="og:url" content="${esc(siteUrl)}">` : ""}
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${esc(seo.locale || "vi_VN")}">
    <meta property="og:site_name" content="${esc(brandName)}">
    <meta property="og:title" content="${esc(seo.title || "")}">
    <meta property="og:description" content="${esc(seo.description || "")}">
    <meta property="og:image" content="${esc(ogImage)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(seo.ogImageAlt || "")}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(seo.title || "")}">
    <meta name="twitter:description" content="${esc(seo.description || "")}">
    <meta name="twitter:image" content="${esc(ogImage)}">
    <meta name="theme-color" content="${esc(seo.themeColor || "#B5341E")}">
    <link rel="icon" type="image/svg+xml" href="public/icons/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="public/icons/favicon-32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="public/icons/apple-touch-icon.png">
    ${preloadMobile}
    ${preloadDesk}`;
    },

    // ─── CHỮ NHÃN TRỢ NĂNG ────────────────────────────
    skipLink() {
      return esc(ui.skipLink);
    },

    // ─── BÀN LỄ TÂN: Ô TRÁI (máy tính) / DẢI TRÊN (điện thoại) ──
    desk() {
      const cta = config.header?.ctaButton || {};
      const heroSec = secOf("hero");

      // Ảnh ô trái: mỗi ảnh khác nhau một tấm; phần nào dùng ảnh nào ghi ở data-sec-slide của từng link
      const slideSrcs = [];
      secs.forEach((s) => {
        if (s.pane && !slideSrcs.includes(s.pane)) slideSrcs.push(s.pane);
      });
      const slideOf = (src) => Math.max(0, slideSrcs.indexOf(src));
      const slides = slideSrcs
        .map((src, i) => {
          const isHero = i === 0 && src === heroDesktop;
          // Ảnh màn hình đầu: tải ngay (ảnh lớn nhất trên máy tính), màn dưới 1024px nhận ảnh trống 1×1.
          // Các ảnh còn lại chỉ ghi vào data-src — JS nạp sau khi trang đã hiện (chỉ trên máy tính),
          // để không tranh băng thông với ảnh đầu tiên.
          let body;
          if (!fileExists(src)) body = placeholder("", "desk__ph", src);
          else if (isHero)
            body = media({ src, alt: "", cls: "desk__img", width: 900, height: 1200, lazy: false, priority: true, style: `object-position:${heroPos.desktop || "50% 25%"}`, sources: [{ media: "(max-width: 1023px)", srcset: BLANK }] });
          else body = `<img class="desk__img" alt="" width="900" height="1200" decoding="async" data-src="${esc(src)}">`;
          return `<li class="desk__slide${i === 0 ? " is-active" : ""}" data-slide="${i}">${body}</li>`;
        })
        .join("\n          ");

      const links = secs
        .map(
          (s) => `<li>
            <a href="#${s.id}" class="index__link" data-sec-link="${s.id}" data-sec-slide="${s.pane ? slideOf(s.pane) : 0}"${s.id === "hero" ? ` aria-current="true"` : ""}>
              <span class="index__no" aria-hidden="true">${s.no}</span>
              <span class="index__label">${esc(s.id === "hero" ? "Trang đầu" : s.label)}</span>
            </a>
          </li>`
        )
        .join("\n          ");

      // Lịch: JS dựng lưới tháng; không có JS thì hiện danh sách ngày đã kín (dựng lúc build)
      const busy = (bk.busyDates || []).filter((d) => viDate(d));
      const busyText = busy.length ? `Ngày đã kín lịch: ${busy.map(viDate).join(", ")}.` : "Hiện còn trống nhiều ngày.";
      const months = Number.isFinite(Number(bk.monthsAhead)) && Number(bk.monthsAhead) > 0 ? Math.floor(Number(bk.monthsAhead)) : 12;

      return `<aside class="desk" id="desk" data-desk aria-label="${esc(bk.title || "Lịch trống")} và ${esc(bk.indexLabel || "Mục lục")}">
    <div class="desk__stage" aria-hidden="true">
      <ul class="desk__slides" data-slides>
          ${slides}
          <li class="desk__slide" data-slide="preview"><img class="desk__img" alt="" decoding="async" data-preview-img hidden></li>
      </ul>
      ${blinds("blinds--desk")}
    </div>

    <div class="desk__bar">
      <a href="#hero" class="desk__brand" aria-label="${esc(brandName)} — về đầu trang">
        <span class="desk__mono" aria-hidden="true">${esc(monogram(brandName))}</span>
        <span class="desk__name">${esc(brandName)}</span>
      </a>
      <p class="desk__now" aria-hidden="true"><span class="desk__now-no" data-now-no></span><span class="desk__now-label" data-now-label>${esc(brandName || heroSec.label)}</span></p>
      <button type="button" class="desk__toggle desk__toggle--m" data-desk-toggle aria-expanded="false" aria-controls="desk-panel">
        ${icon("calendar", "desk__toggle-icon")}<span>${esc(bk.title || "Lịch trống")}</span>
      </button>
      <button type="button" class="desk__toggle desk__toggle--d" data-index-toggle aria-expanded="false" aria-controls="desk-index">
        ${icon("list", "desk__toggle-icon")}<span>${esc(bk.indexLabel || "Mục lục")}</span>
      </button>
    </div>

    <div class="desk__panel" id="desk-panel">
      <nav class="index" id="desk-index" aria-label="${esc(bk.indexLabel || "Mục lục")}">
        <ol class="index__list">
          ${links}
        </ol>
      </nav>

      <div class="desk__card">
        <div class="desk__caption">
          <p class="desk__count" aria-hidden="true"><span data-cap-no>${heroSec.no}</span> / ${total}</p>
          <p class="desk__cap-label" data-cap-label>${esc(heroSec.label)}</p>
          <div class="desk__steps">
            <button type="button" class="step" data-step="-1" aria-label="Phần trước">${icon("arrowUp", "step__icon")}</button>
            <button type="button" class="step" data-step="1" aria-label="Phần sau">${icon("arrowDown", "step__icon")}</button>
          </div>
        </div>

        <section class="cal" data-cal data-busy="${esc(JSON.stringify(busy))}" data-months="${months}" data-pick-label="${esc(bk.pickLabel || "Điền phiếu cho ngày")}" aria-labelledby="cal-title">
          <div class="cal__head">
            <h2 id="cal-title" class="cal__title">${esc(bk.title || "Lịch trống")}</h2>
            <p class="cal__summary" data-cal-summary></p>
            <button type="button" class="cal__fold" data-cal-fold aria-expanded="true" aria-controls="cal-body">
              <span class="sr-only">Thu gọn / mở lịch</span>${icon("chevronDown", "cal__fold-icon")}
            </button>
          </div>
          <div class="cal__body" id="cal-body">
            <div class="cal__nav">
              <button type="button" class="cal__step" data-cal-prev aria-label="Tháng trước">${icon("arrowLeft", "cal__step-icon")}</button>
              <p class="cal__month" data-cal-month aria-live="polite"></p>
              <button type="button" class="cal__step" data-cal-next aria-label="Tháng sau">${icon("arrowRight", "cal__step-icon")}</button>
            </div>
            <p class="cal__week" aria-hidden="true"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></p>
            <div class="cal__grid" data-cal-grid></div>
            <p class="cal__fallback" data-cal-fallback>${esc(busyText)}</p>
            ${bk.note ? `<p class="cal__note">${esc(bk.note)}</p>` : ""}
          </div>
        </section>

        <div class="desk__cta">
          <a ${linkAttrs(h.ctaLink)} class="btn btn--bone">${icon("zalo", "btn__icon")}<span>${esc(cta.label || "Đặt lịch qua Zalo")}</span></a>
          <a href="#contact" class="btn btn--line" data-cal-pick hidden><span data-cal-pick-text></span>${icon("arrowRight", "btn__icon")}</a>
        </div>
      </div>
    </div>
  </aside>`;
    },

    // ─── MÀN HÌNH ĐẦU: ẢNH QUA MÀNH SÁO ───────────────
    heroSection() {
      const p = hero.ctaPrimary || {};
      const s = hero.ctaSecondary || {};
      // Ảnh này chỉ hiện dưới 1024px (máy tính dùng ảnh ở ô trái) → từ 1024px nhận ảnh trống
      const photo = fileExists(heroDesktop) || fileExists(heroMobile)
        ? media({
            src: fileExists(heroDesktop) ? heroDesktop : heroMobile,
            mobileSrc: fileExists(heroMobile) && fileExists(heroDesktop) ? heroMobile : "",
            alt: hero.backgroundAlt || brandName,
            cls: "hero__img",
            width: 900,
            height: 1200,
            mobileWidth: 600,
            mobileHeight: 750,
            priority: true,
            lazy: false,
            style: `--pos-m:${heroPos.mobile || "50% 22%"};--pos:${heroPos.desktop || "50% 25%"}`,
            sources: [{ media: "(min-width: 1024px)", srcset: BLANK }],
          }) + placeholder("Ảnh MC", "hero__ph")
        : placeholder("Ảnh MC", "hero__ph", heroDesktop || "public/images/hero/hero-01.webp");

      return `<section id="hero" class="hero" aria-labelledby="hero-title" data-sec>
      <figure class="hero__photo">
        ${photo}
        ${blinds("blinds--hero")}
      </figure>
      <div class="hero__text">
        <p class="hero__brand"><span class="hero__name">${esc(brandName)}</span><span class="hero__tag">${esc(config.brand?.tagline || "")}</span></p>
        <h1 id="hero-title" class="hero__title">${titleLines(hero.heading || "")}</h1>
        ${hero.subheading ? `<p class="hero__sub">${esc(hero.subheading)}</p>` : ""}
        ${hero.availability ? `<p class="hero__avail"><span class="hero__dot" aria-hidden="true"></span>${esc(hero.availability)}</p>` : ""}
        <div class="hero__cta">
          <a ${linkAttrs(h.heroCtaLink)} class="btn btn--brick">${icon("zalo", "btn__icon")}<span>${esc(p.label || "Đặt lịch qua Zalo")}</span></a>
          ${s.label ? `<a ${linkAttrs(s.href && !isPlaceholder(s.href) ? s.href : "#videos")} class="btn btn--ghost">${icon("play", "btn__icon")}<span>${esc(s.label)}</span></a>` : ""}
        </div>
        ${hero.scrollIndicator ? `<p class="hero__scroll" aria-hidden="true">${icon("arrowDown", "hero__scroll-icon")}Cuộn xuống</p>` : ""}
      </div>
    </section>`;
    },

    // ─── GIỚI THIỆU ───────────────────────────────────
    aboutSection() {
      const a = config.about || {};
      const story = String(a.story || "")
        .split(/\n\s*\n/)
        .filter((t) => t.trim())
        .map((t) => `<p>${lines(t.trim())}</p>`)
        .join("\n          ");
      const stats = (a.stats || [])
        .map((st) => `<li class="stats__item"><strong class="stats__num">${esc(st.number)}</strong><span class="stats__label">${esc(st.label)}</span></li>`)
        .join("\n          ");
      // Chân dung chỉ hiện dưới 1024px (máy tính xem ở ô trái) — ảnh lazy trong khối display:none không bị tải
      const portrait = pic(
        { src: a.portrait, mobileSrc: fileExists(a.portraitMobile) ? a.portraitMobile : undefined, alt: a.portraitAlt || brandName, cls: "about__img", width: 600, height: 800, mobileWidth: 400, mobileHeight: 500 },
        "Chân dung",
        "about__ph"
      );

      return `<section id="about" class="sec" aria-labelledby="about-title" data-sec>
      ${secHead(a, "about", "Giới thiệu")}
      <div class="about">
        <figure class="about__photo reveal stripes">${portrait}</figure>
        <div class="about__text">
          ${a.summary ? `<p class="about__summary reveal">${esc(a.summary)}</p>` : ""}
          ${story ? `<div class="about__story" id="about-story" data-collapsible>
          ${story}
          </div>
          ${a.summary ? moreButton("about-story", 0, a.storyToggleLabel || "Đọc trọn câu chuyện", true) : ""}` : ""}
        </div>
      </div>
      ${stats ? `<ul class="stats reveal">
          ${stats}
      </ul>` : ""}
    </section>`;
    },

    // ─── SỔ KHÁCH (cảm nhận) ──────────────────────────
    testimonialsSection() {
      const test = config.testimonials || {};
      const items = test.items || [];
      if (!items.length) return "";
      const shown = visibleCount(test.mobileVisible, 2);
      const ratings = items.map((t) => Math.max(0, Math.min(5, Number(t.rating) || 5)));
      const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1).replace(".", ",");

      const score = `<p class="score reveal">
          <strong class="score__num">${avg}</strong><span class="score__of">/5</span>
          <span class="score__meta">${Array.from({ length: 5 }, () => icon("star", "score__star")).join("")}<span>Trung bình từ ${items.length} lời nhắn</span></span>
        </p>`;

      const entries = items
        .map((t, i) => {
          const rating = ratings[i];
          const stars = Array.from({ length: rating }, () => icon("star", "note__star")).join("");
          const initial = (t.name || "?").trim().split(/\s+/).pop().charAt(0);
          return `<li class="note${i === 0 ? " note--lead" : ""}${i >= shown ? " is-extra" : ""} reveal">
          <figure>
            <blockquote class="note__text"><p>${esc(t.content || "")}</p></blockquote>
            <figcaption class="note__by">
              <span class="note__avatar">
                ${fileExists(t.avatar) ? media({ src: t.avatar, alt: "", cls: "note__avatar-img", width: 100, height: 100 }) : `<span class="note__initial" data-missing="${esc(t.avatar || "")}" aria-hidden="true">${esc(initial)}</span>`}
              </span>
              <span class="note__who">
                <span class="note__name">${esc(t.name || "")}</span>
                <span class="note__role">${esc(t.role || "")}</span>
              </span>
              <span class="note__rating" role="img" aria-label="${rating} trên 5 sao">${stars}</span>
            </figcaption>
          </figure>
        </li>`;
        })
        .join("\n        ");

      return `<section id="testimonials" class="sec" aria-labelledby="testimonials-title" data-sec>
      ${secHead(test, "testimonials", "Khách hàng nói gì", score)}
      <ol id="testimonials-list" class="guest" data-collapsible>
        ${entries}
      </ol>
      ${moreButton("testimonials-list", items.length - shown)}
    </section>`;
    },

    // ─── DỊCH VỤ: HÀNG CHỌN + KHUNG CHI TIẾT ──────────
    servicesSection() {
      const sv = config.services || {};
      const items = sv.items || [];
      if (!items.length) return "";
      const types = config.contact?.form?.eventTypes || [];
      const count = pad(items.length);

      const tabs = items
        .map(
          (s, i) => `<button type="button" class="rooms__tab" id="svc-tab-${i + 1}" data-tab="${i}" aria-controls="svc-panel-${i + 1}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
            <span class="rooms__tab-no" aria-hidden="true">${pad(i + 1)}</span><span>${esc(s.title || "")}</span>
          </button>`
        )
        .join("\n          ");

      const panels = items
        .map((s, i) => {
          const ask = matchEventType(s.title, types);
          return `<article class="room${i === 0 ? " is-active" : ""}" id="svc-panel-${i + 1}" data-panel="${i}" aria-labelledby="svc-title-${i + 1}">
          <figure class="room__photo">
            ${pic({ src: s.image, alt: s.title || "", cls: "room__img", width: 640, height: 640 }, "", "room__ph", s.icon || "image")}
          </figure>
          <div class="room__body">
            <p class="room__no"><span>${pad(i + 1)}</span> / ${count}</p>
            <h3 id="svc-title-${i + 1}" class="room__title">${icon(s.icon || "event", "room__icon")}${esc(s.title || "")}</h3>
            <p class="room__desc">${esc(s.description || "")}</p>
            <a href="#contact" class="link-arrow" data-ask="${esc(ask)}" data-ask-note="${esc(s.title || "")}">${esc(sv.askLabel || "Hỏi lịch cho")} ${esc(s.title || "")}${icon("arrowRight", "link-arrow__icon")}</a>
          </div>
        </article>`;
        })
        .join("\n        ");

      return `<section id="services" class="sec" aria-labelledby="services-title" data-sec>
      ${secHead(sv, "services", "Dịch vụ")}
      <div class="rooms" data-tabs>
        <div class="rooms__tabs" data-tablist aria-label="Chọn dịch vụ" hidden>
          ${tabs}
        </div>
        <div class="rooms__panels">
        ${panels}
        </div>
      </div>
    </section>`;
    },

    // ─── THƯỚC PHIM (video) ───────────────────────────
    videosSection() {
      const f = vid.featured || {};
      const items = vid.items || [];
      if (!hasFeatured && !items.length) return "";

      const reel = hasFeatured
        ? `<figure class="reel reveal">
          <button type="button" class="reel__frame" ${videoAttrs(f.videoUrl, f.title)}>
            <span class="reel__media stripes">
              ${pic({ src: f.thumbnail, alt: "", cls: "reel__img", width: 1280, height: 720 }, "Showreel", "reel__ph", "play")}
            </span>
            <span class="reel__play" aria-hidden="true">${icon("play", "reel__play-icon")}</span>
            <span class="sr-only">Phát video: ${esc(f.title || "Showreel")}</span>
          </button>
          <figcaption class="reel__plate"><span class="reel__title">${esc(f.title || "")}</span>${f.duration ? `<span class="reel__time">${esc(f.duration)}</span>` : ""}</figcaption>
        </figure>`
        : "";

      const clips = items
        .map(
          (v, i) => `<li class="clip">
            <button type="button" class="clip__btn" ${videoAttrs(v.videoUrl, v.title)}>
              <span class="clip__media">
                ${pic({ src: v.thumbnail, alt: "", cls: "clip__img", width: 640, height: 360 }, "", "clip__ph", "play")}
                <span class="clip__play" aria-hidden="true">${icon("play", "clip__play-icon")}</span>
              </span>
              <span class="clip__meta">
                <span class="clip__no" aria-hidden="true">${pad(i + 1)}</span>
                <span class="clip__title">${esc(v.title || "")}</span>
                ${v.duration ? `<span class="clip__time"><span class="sr-only">, thời lượng </span>${esc(v.duration)}</span>` : ""}
              </span>
            </button>
          </li>`
        )
        .join("\n          ");

      return `<section id="videos" class="sec" aria-labelledby="videos-title" data-sec>
      ${secHead(vid, "videos", "Video")}
      ${reel}
      ${clips ? `<ul class="clips" aria-label="Video khác — vuốt ngang để xem">
          ${clips}
      </ul>` : ""}
    </section>`;
    },

    // ─── KHOẢNH KHẮC (gallery) ────────────────────────
    gallerySection() {
      const g = config.gallery || {};
      if (!gal.length) return "";
      const all = (g.categories || [])[0] || "Tất cả";
      // Chỉ hiện nút lọc cho loại có ảnh, kèm số ảnh
      const counts = {};
      gal.forEach((it) => (counts[it.category] = (counts[it.category] || 0) + 1));
      const cats = (g.categories || []).slice(1).filter((c) => counts[c]);
      const filters = cats.length > 1
        ? `<div class="filters" role="group" aria-label="Lọc ảnh theo loại sự kiện">
          <button type="button" class="filters__btn" data-filter="*" aria-pressed="true">${esc(all)} <span class="filters__n">${gal.length}</span></button>
          ${cats.map((c) => `<button type="button" class="filters__btn" data-filter="${esc(c)}" aria-pressed="false">${esc(c)} <span class="filters__n">${counts[c]}</span></button>`).join("\n          ")}
        </div>`
        : "";

      const shots = gal
        .map((it, i) => {
          const m = mobileVariant(it.src);
          return `<li class="shot" data-category="${esc(it.category || "")}">
            <button type="button" class="shot__btn" data-lightbox="${esc(it.src)}"${fileExists(m) ? ` data-lightbox-m="${esc(m)}"` : ""} data-alt="${esc(it.alt || "")}" data-pane="${esc(it.src)}" aria-haspopup="dialog" aria-controls="lightbox">
              ${pic({ src: it.src, alt: it.alt || "", cls: "shot__img", width: 1200, height: 900 }, "", "shot__ph")}
              <span class="shot__no" aria-hidden="true">${pad(i + 1)}</span>
            </button>
          </li>`;
        })
        .join("\n          ");

      return `<section id="gallery" class="sec" aria-labelledby="gallery-title" data-sec>
      ${secHead(g, "gallery", "Khoảnh khắc")}
      ${filters}
      <div class="album">
        <ul class="album__track" id="gallery-list" data-track tabindex="0" aria-label="Ảnh sự kiện — vuốt ngang để xem">
          ${shots}
        </ul>
        <div class="album__ctrl">
          <button type="button" class="step step--ink" data-track-step="-1" aria-label="${esc(ui.prevLabel)}">${icon("arrowLeft", "step__icon")}</button>
          <p class="album__count" aria-hidden="true"><span data-track-now>01</span> / <span data-track-total>${pad(gal.length)}</span></p>
          <button type="button" class="step step--ink" data-track-step="1" aria-label="${esc(ui.nextLabel)}">${icon("arrowRight", "step__icon")}</button>
        </div>
      </div>
    </section>`;
    },

    // ─── ĐỐI TÁC: BẢNG Ô KẺ MẢNH ──────────────────────
    partnersSection() {
      const p = config.partners || {};
      const items = p.items || [];
      if (!items.length) return "";
      const cells = items
        .map(
          (it, i) => `<li class="ledger__cell">
            <span class="ledger__no" aria-hidden="true">${pad(i + 1)}</span>
            ${fileExists(it.logo)
              ? media({ src: it.logo, alt: it.name || "", cls: "ledger__logo", width: 200, height: 80 })
              : `<span class="ledger__name">${esc(it.name || "")}</span>`}
          </li>`
        )
        .join("\n          ");
      return `<section id="partners" class="sec" aria-labelledby="partners-title" data-sec>
      ${secHead(p, "partners", "Đối tác")}
      <ul class="ledger reveal">
          ${cells}
      </ul>
    </section>`;
    },

    // ─── HỎI ĐÁP: THẺ HƯỚNG DẪN (hiện sẵn) ────────────
    faqSection() {
      const q = config.faq || {};
      const items = q.items || [];
      if (!items.length) return "";
      const shown = visibleCount(q.mobileVisible, 3);
      const rows = items
        .map(
          (it, i) => `<div class="card${i >= shown ? " is-extra" : ""} reveal">
          <dt class="card__q"><span class="card__tag" aria-hidden="true">Hỏi</span>${esc(it.question || "")}</dt>
          <dd class="card__a">${esc(it.answer || "")}</dd>
        </div>`
        )
        .join("\n        ");
      return `<section id="faq" class="sec" aria-labelledby="faq-title" data-sec>
      ${secHead({ heading: q.heading }, "faq", "Câu hỏi thường gặp")}
      <dl id="faq-list" class="cards" data-collapsible>
        ${rows}
      </dl>
      ${moreButton("faq-list", items.length - shown)}
      ${q.subheading ? `<p class="faq-end">${esc(q.subheading)} <a ${linkAttrs(h.zaloLink)} class="link-arrow">Nhắn Zalo${icon("arrowRight", "link-arrow__icon")}</a></p>` : ""}
    </section>`;
    },

    // ─── ĐẶT LỊCH: QUẦY LIÊN HỆ + PHIẾU ───────────────
    contactSection() {
      const c = config.contact || {};
      const f = c.form || {};
      const row = (iconName, label, value, href) =>
        `<li class="frontdesk__row">${icon(iconName, "frontdesk__icon")}<span class="frontdesk__key">${esc(label)}</span>${href ? `<a ${linkAttrs(href)} class="frontdesk__val">${esc(value)}</a>` : `<span class="frontdesk__val">${esc(value)}</span>`}</li>`;
      const rows = [
        row("email", "Email", h.emailDisplay, h.emailRaw ? h.emailLink : ""),
        !isPlaceholder(c.facebook) && c.facebook ? row("facebook", "Facebook", "Trang cá nhân", h.facebookLink) : "",
        !isPlaceholder(c.youtube) && c.youtube ? row("youtube", "YouTube", "Kênh video", h.youtubeLink) : "",
        c.workingHours ? row("clock", "Giờ nhận lịch", c.workingHours) : "",
        c.address && !isPlaceholder(c.address) ? row("location", "Khu vực", c.address) : "",
      ].filter(Boolean).join("\n            ");
      const options = (f.eventTypes || []).map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");

      return `<section id="contact" class="sec sec--contact" aria-labelledby="contact-title" data-sec>
      ${secHead(c, "contact", "Liên hệ")}
      <div class="booking">
        <div class="frontdesk reveal">
          <p class="frontdesk__label">Đường dây đặt lịch</p>
          <a href="${esc(h.phoneLink)}" class="frontdesk__phone">${esc(h.phoneDisplay)}</a>
          <div class="frontdesk__btns">
            <a href="${esc(h.phoneLink)}" class="btn btn--brick">${icon("phone", "btn__icon")}<span>Gọi ngay</span></a>
            <a ${linkAttrs(h.zaloLink)} class="btn btn--ghost">${icon("zalo", "btn__icon")}<span>Nhắn Zalo</span></a>
          </div>
          <ul class="frontdesk__list">
            ${rows}
          </ul>
        </div>

        <form class="slip reveal" id="contact-form" data-email="${esc(h.emailRaw)}" novalidate>
          <div class="slip__head">
            <p class="slip__title">${esc(f.heading || "Phiếu đặt lịch")}</p>
            ${f.note ? `<p class="slip__note">${esc(f.note)}</p>` : ""}
          </div>
          <div class="slip__grid">
            <p class="field">
              <label for="f-name" class="field__label">Họ và tên <span aria-hidden="true">*</span></label>
              <input id="f-name" name="name" type="text" class="field__input" autocomplete="name" required>
            </p>
            <p class="field">
              <label for="f-phone" class="field__label">Số điện thoại <span aria-hidden="true">*</span></label>
              <input id="f-phone" name="phone" type="tel" class="field__input" inputmode="tel" autocomplete="tel" pattern="[0-9+ .()-]{8,}" required>
            </p>
            <p class="field">
              <label for="f-date" class="field__label">Ngày tổ chức</label>
              <input id="f-date" name="date" type="date" class="field__input" data-date-input>
            </p>
            <p class="field">
              <label for="f-type" class="field__label">Loại sự kiện</label>
              <select id="f-type" name="eventType" class="field__input field__select" data-type-input>
                <option value="">— Chọn loại sự kiện —</option>${options}
              </select>
            </p>
            <p class="field field--wide">
              <label for="f-msg" class="field__label">Lời nhắn</label>
              <textarea id="f-msg" name="message" rows="4" class="field__input" placeholder="Địa điểm, số khách, mong muốn về chương trình…" data-msg-input></textarea>
            </p>
          </div>
          <button type="submit" class="btn btn--brick btn--full">${icon("send", "btn__icon")}<span>${esc(f.submitLabel || "Gửi yêu cầu")}</span></button>
          <p class="slip__status" data-form-status role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`;
    },

    // ─── CHÂN TRANG ───────────────────────────────────
    footerSection() {
      const f = config.footer || {};
      const menu = (config.header?.menuItems || [])
        .map((m) => `<li><a ${linkAttrs(m.href || "#hero")} class="foot__link">${esc(m.label || "")}</a></li>`)
        .join("\n          ");
      const socials = [
        ["phone", "Gọi điện", h.phoneLink],
        ["zalo", "Zalo", h.zaloLink],
        ["email", "Email", h.emailLink],
        ["facebook", "Facebook", h.facebookLink],
        ["youtube", "YouTube", h.youtubeLink],
      ]
        .map(([ic, label, href]) => `<li><a ${linkAttrs(href)} class="foot__social" aria-label="${label}">${icon(ic, "foot__social-icon")}</a></li>`)
        .join("\n          ");

      return `<footer class="foot">
    <p class="foot__name">${esc(brandName)}</p>
    <p class="foot__tag">${esc(config.brand?.tagline || "")}</p>
    ${menu ? `<nav class="foot__nav" aria-label="Mục lục chân trang">
      <ul class="foot__menu">
          ${menu}
      </ul>
    </nav>` : ""}
    <ul class="foot__socials">
          ${socials}
    </ul>
    <p class="foot__meta">${esc(f.copyright || "")}<br>${esc(f.madeWith || "")}</p>
    ${f.backToTop ? `<a href="#hero" class="foot__top">${icon("arrowUp", "foot__top-icon")}Về đầu trang</a>` : ""}
  </footer>`;
    },

    // ─── NÚT NỔI (điện thoại) ─────────────────────────
    floatingButton() {
      const fb = config.floatingButton || {};
      if (fb.enabled === false) return "";
      return `<a ${linkAttrs(h.floatingLink)} class="fab" data-fab aria-label="${esc(fb.label || "Chat Zalo")}">
    ${icon(fb.type === "phone" ? "phone" : "zalo", "fab__icon")}
    <span class="fab__label" aria-hidden="true">${esc(fb.label || "Chat Zalo")}</span>
  </a>`;
    },

    // ─── HỘP THOẠI: XEM ẢNH + PHÁT VIDEO ─────────────
    dialogs() {
      return `<dialog id="lightbox" class="viewer" aria-label="Xem ảnh">
    <div class="viewer__bar">
      <p class="viewer__count" data-count aria-live="polite"></p>
      <button type="button" class="viewer__btn" data-close aria-label="${esc(ui.closeLabel)}">${icon("close", "viewer__icon")}</button>
    </div>
    <figure class="viewer__stage" data-stage>
      <img alt="" class="viewer__img" data-img>
      <figcaption class="viewer__cap" data-caption></figcaption>
    </figure>
    <div class="viewer__nav">
      <button type="button" class="viewer__btn" data-prev aria-label="${esc(ui.prevLabel)}">${icon("arrowLeft", "viewer__icon")}</button>
      <button type="button" class="viewer__btn" data-next aria-label="${esc(ui.nextLabel)}">${icon("arrowRight", "viewer__icon")}</button>
    </div>
  </dialog>

  <dialog id="player" class="viewer viewer--video" aria-label="Trình phát video">
    <div class="viewer__bar">
      <p class="viewer__count" data-video-title></p>
      <button type="button" class="viewer__btn" data-close aria-label="${esc(ui.closeLabel)}">${icon("close", "viewer__icon")}</button>
    </div>
    <div class="viewer__screen" data-player></div>
    <div class="viewer__missing" data-missing-note hidden>
      <p>${esc(ui.videoMissing)}</p>
      <a href="#contact" class="btn btn--bone" data-close-link>Liên hệ ngay</a>
    </div>
  </dialog>`;
    },
  };
}

// ─── RENDER PAGE ────────────────────────────────────────

/**
 * Ghép template + config → HTML hoàn chỉnh
 * @param {string} template — Nội dung index.html (file khung)
 * @param {object} config — SITE_CONFIG
 * @returns {{ html: string, missing: string[] }}
 */
export function renderPage(template, config) {
  const renderers = createRenderers(config);
  const missing = [];

  // Xóa comment hướng dẫn ở đầu file
  let html = template.replace(/<!--\s*ĐÂY LÀ FILE KHUNG[\s\S]*?-->\s*\n?/, "");

  // 1) Thay thế renderer blocks: {{{ @tenRenderer }}}
  html = html.replace(/\{\{\{\s*@(\w+)\s*\}\}\}/g, (match, name) => {
    if (typeof renderers[name] === "function") {
      return renderers[name]();
    }
    missing.push(`@${name}`);
    return "";
  });

  // 2) Thay thế giá trị: {{ duong.dan }}
  html = html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const val = path.split(".").reduce((obj, key) => (obj == null ? undefined : obj[key]), config);
    if (val === undefined || val === null || typeof val === "object") {
      missing.push(path);
      return "";
    }
    return esc(String(val));
  });

  return { html, missing };
}
