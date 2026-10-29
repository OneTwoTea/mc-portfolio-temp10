/**
 * ═══════════════════════════════════════════════════════════
 *  MAIN.JS — JavaScript phía trình duyệt (giao diện "Bàn Đặt Lịch")
 *  - Bàn lễ tân: dải đỏ (điện thoại) mở/đóng bảng lịch + mục lục; ô trái (máy tính)
 *    đổi ảnh theo phần đang xem, chuyển ảnh bằng mành sáo khép rồi mở
 *  - Lịch trống: dựng lưới tháng, chọn ngày → điền sẵn vào phiếu đặt lịch
 *  - Dịch vụ dạng hàng chọn (tab), "Hỏi lịch" chọn sẵn loại sự kiện
 *  - Thu gọn danh sách, lọc + dải ảnh vuốt ngang, lightbox (vuốt), trình phát video
 *  - Nút nổi, form gửi qua ứng dụng email
 *  Không dùng thư viện ngoài. Trang vẫn đọc được đầy đủ khi không có JS.
 * ═══════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isWide = window.matchMedia("(min-width: 1024px)");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n) => String(n).padStart(2, "0");

  const desk = $("[data-desk]");

  // ─── HIỆN DẦN KHI CUỘN TỚI ────────────────────────────
  const revealTargets = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  // ─── BẢNG MỞ RA TỪ DẢI ĐỎ (điện thoại) & MỤC LỤC (máy tính) ──
  /** Nút mở/đóng một bảng: aria-expanded, Esc để đóng, bấm ra ngoài để đóng, trả focus về nút */
  function setupToggle(btn, openClass, onChange) {
    if (!btn || !desk) return () => {};
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    const isOpen = () => desk.classList.contains(openClass);
    function set(open, focusBack = false) {
      desk.classList.toggle(openClass, open);
      btn.setAttribute("aria-expanded", String(open));
      onChange?.(open);
      if (open) {
        const first = panel && $("a, button", panel);
        // Đợi bảng hiện xong mới chuyển focus (tránh nhảy cuộn)
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
      } else if (focusBack) {
        btn.focus();
      }
    }
    btn.addEventListener("click", () => set(!isOpen()));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) set(false, true);
    });
    document.addEventListener("click", (e) => {
      if (isOpen() && !desk.contains(e.target)) set(false);
    });
    // Bấm một mục trong bảng → đóng bảng rồi cuộn tới
    panel?.addEventListener("click", (e) => {
      if (e.target.closest("a[href^='#']")) set(false);
    });
    return set;
  }

  const fab = $("[data-fab]");
  let deskOpen = false;
  const closePanel = setupToggle($("[data-desk-toggle]"), "is-open", (open) => {
    deskOpen = open;
    syncFab();
  });
  const closeIndex = setupToggle($("[data-index-toggle]"), "is-index-open");
  // Đổi cỡ màn hình qua mốc 1024px → đóng hết các bảng đang mở
  isWide.addEventListener?.("change", () => {
    closePanel(false);
    closeIndex(false);
  });

  // ─── Ô TRÁI: ẢNH THEO PHẦN ĐANG XEM (máy tính) ────────
  const slides = $$("[data-slide]");
  const blinds = $(".blinds--desk");
  const previewImg = $("[data-preview-img]");
  let activeSlide = "0";
  let wantedSlide = "0";
  let switching = false;

  /** Gán src thật cho ảnh đang chờ (data-src) */
  function loadSlide(el) {
    const img = el && $("img[data-src]", el);
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
    return el && $("img", el);
  }

  /** Chờ ảnh tải xong (tối đa `ms`) để mành mở ra là thấy ảnh ngay */
  function ready(img, ms = 700) {
    if (!img || !img.src || img.complete) return Promise.resolve();
    const done = img.decode ? img.decode().catch(() => {}) : new Promise((r) => img.addEventListener("load", r, { once: true }));
    return Promise.race([done, wait(ms)]);
  }

  /** Khép mành → đổi ảnh → mở mành. Gọi liên tục khi cuộn nhanh thì chỉ lấy đích cuối cùng. */
  async function showSlide(key) {
    wantedSlide = String(key);
    if (!isWide.matches || switching || wantedSlide === activeSlide) return;
    switching = true;
    while (wantedSlide !== activeSlide) {
      const target = wantedSlide;
      // "preview:<đường dẫn ảnh>" = ảnh gallery đang được rê chuột/chọn
      const isPreview = target.startsWith("preview:");
      const next = slides.find((s) => s.dataset.slide === (isPreview ? "preview" : target));
      if (!next) break;
      const img = loadSlide(next);
      if (reduceMotion || !blinds) {
        if (isPreview) img.src = target.slice(8);
        await ready(img, 300);
      } else {
        blinds.classList.add("is-closed");
        await wait(380 + 7 * 34);
        // Mành đã khép kín → lúc này mới đổi ảnh xem trước (không lộ cảnh ảnh cũ bị thay)
        if (isPreview) img.src = target.slice(8);
        await ready(img);
      }
      slides.forEach((s) => s.classList.toggle("is-active", s === next));
      activeSlide = target;
      if (blinds && !reduceMotion) {
        await wait(60);
        if (wantedSlide === activeSlide) blinds.classList.remove("is-closed");
      }
    }
    blinds?.classList.remove("is-closed");
    switching = false;
  }

  // Máy tính: sau khi trang tải xong thì nạp sẵn các ảnh còn lại để đổi ảnh không phải chờ
  function preloadSlides() {
    if (!isWide.matches) return;
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    idle(() => slides.forEach(loadSlide));
  }
  if (document.readyState === "complete") preloadSlides();
  else window.addEventListener("load", preloadSlides, { once: true });
  isWide.addEventListener?.("change", preloadSlides);

  // ─── PHẦN ĐANG XEM (scrollspy) ────────────────────────
  const secLinks = $$("[data-sec-link]");
  const sections = secLinks.map((a) => document.getElementById(a.dataset.secLink)).filter(Boolean);
  const nowNo = $("[data-now-no]");
  const nowLabel = $("[data-now-label]");
  const capNo = $("[data-cap-no]");
  const capLabel = $("[data-cap-label]");
  let currentId = sections[0]?.id || "";

  function setCurrent(id) {
    currentId = id;
    let label = "";
    let no = "";
    let slide = "0";
    secLinks.forEach((a) => {
      const on = a.dataset.secLink === id;
      if (on) {
        a.setAttribute("aria-current", "true");
        no = $(".index__no", a)?.textContent || "";
        label = $(".index__label", a)?.textContent || "";
        slide = a.dataset.secSlide || "0";
      } else {
        a.removeAttribute("aria-current");
      }
    });
    // Màn hình đầu: dải đỏ hiện tên MC (không số) thay cho chữ "Trang đầu"
    const atHero = id === sections[0]?.id;
    if (nowNo) nowNo.textContent = atHero ? "" : no;
    if (nowLabel) nowLabel.textContent = atHero ? nowLabel.dataset.heroLabel || label : label;
    if (capNo) capNo.textContent = no;
    if (capLabel) capLabel.textContent = label;
    showSlide(slide);
  }
  if (nowLabel) nowLabel.dataset.heroLabel = nowLabel.textContent;

  if (sections.length && "IntersectionObserver" in window) {
    // Phần "đang xem" = phần cắt qua đường ngang 40% chiều cao màn hình
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -59% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Nút lên/xuống trong chú thích ô trái
  $$("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = sections.findIndex((s) => s.id === currentId);
      const next = sections[Math.min(sections.length - 1, Math.max(0, i + Number(btn.dataset.step)))];
      next?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // ─── LỊCH TRỐNG ───────────────────────────────────────
  const cal = $("[data-cal]");
  const dateInput = $("[data-date-input]");
  const pick = $("[data-cal-pick]");
  const pickText = $("[data-cal-pick-text]");

  /** Nháy nền ô nhập để báo "đã điền sẵn" */
  function flash(input) {
    if (!input) return;
    input.classList.remove("is-filled");
    void input.offsetWidth;
    input.classList.add("is-filled");
  }

  if (cal) {
    const grid = $("[data-cal-grid]", cal);
    const monthEl = $("[data-cal-month]", cal);
    const prev = $("[data-cal-prev]", cal);
    const next = $("[data-cal-next]", cal);
    const fold = $("[data-cal-fold]", cal);
    const summary = $("[data-cal-summary]", cal);
    let busy = [];
    try {
      busy = JSON.parse(cal.dataset.busy || "[]");
    } catch {
      busy = [];
    }
    const busySet = new Set(busy);
    const months = Math.max(1, Number(cal.dataset.months) || 12);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const todayIso = iso(today);
    const fmtMonth = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
    const fmtDay = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" });
    // Số tháng tính từ tháng hiện tại. Cuối tháng (còn < 7 ngày) thì mở sẵn tháng sau.
    const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
    let offset = daysLeft < 7 && months > 1 ? 1 : 0;
    let selected = "";

    function render() {
      const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // thứ Hai đứng đầu
      const label = fmtMonth.format(first);
      monthEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      prev.disabled = offset <= 0;
      next.disabled = offset >= months - 1;

      let free = 0;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < lead; i++) frag.appendChild(document.createElement("span"));
      for (let d = 1; d <= days; d++) {
        const date = new Date(first.getFullYear(), first.getMonth(), d);
        const key = iso(date);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day";
        btn.dataset.date = key;
        const n = document.createElement("span");
        n.className = "day__n";
        n.textContent = d;
        btn.appendChild(n);
        let state = "còn trống";
        if (date < today) {
          btn.classList.add("day--past");
          btn.disabled = true;
          state = "đã qua";
        } else if (busySet.has(key)) {
          btn.classList.add("day--busy");
          btn.setAttribute("aria-disabled", "true");
          state = "đã kín lịch";
        } else {
          btn.classList.add("day--free");
          btn.setAttribute("aria-pressed", String(key === selected));
          free++;
        }
        if (key === todayIso) {
          btn.classList.add("day--today");
          state += ", hôm nay";
        }
        btn.setAttribute("aria-label", `${fmtDay.format(date)} — ${state}`);
        frag.appendChild(btn);
      }
      grid.replaceChildren(frag);
      if (summary) summary.textContent = `Tháng ${first.getMonth() + 1} · còn ${free} ngày trống`;
    }

    function select(key, fromInput = false) {
      selected = key;
      $$(".day--free", grid).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.date === key)));
      if (!key) {
        if (pick) pick.hidden = true;
        return;
      }
      const [y, m, d] = key.split("-");
      if (pickText) pickText.textContent = `${cal.dataset.pickLabel || "Điền phiếu cho ngày"} ${d}/${m}`;
      if (pick) pick.hidden = false;
      if (dateInput && !fromInput) {
        dateInput.value = `${y}-${m}-${d}`;
        flash(dateInput);
      }
    }

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".day");
      if (!btn || btn.disabled) return;
      if (btn.classList.contains("day--busy")) {
        monthEl.textContent = `${btn.dataset.date.split("-").reverse().slice(0, 2).join("/")} đã kín lịch — chọn ngày khác nhé`;
        setTimeout(render, 1800);
        return;
      }
      select(btn.dataset.date === selected ? "" : btn.dataset.date);
    });
    prev.addEventListener("click", () => {
      offset = Math.max(0, offset - 1);
      render();
    });
    next.addEventListener("click", () => {
      offset = Math.min(months - 1, offset + 1);
      render();
    });

    // Khách tự gõ ngày trong phiếu → lịch nhảy tới tháng đó và đánh dấu
    dateInput?.addEventListener("change", () => {
      const v = dateInput.value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return select("", true);
      const [y, m] = v.split("-").map(Number);
      const o = (y - today.getFullYear()) * 12 + (m - 1 - today.getMonth());
      if (o >= 0 && o < months) {
        offset = o;
        render();
      }
      select(busySet.has(v) ? "" : v, true);
    });

    // Máy tính: lịch thu gọn sẵn (trừ màn rất cao) để ảnh ô trái được nhìn rõ; bấm ˅ để mở
    function setFold(folded) {
      cal.classList.toggle("is-folded", folded);
      fold?.setAttribute("aria-expanded", String(!folded));
    }
    fold?.addEventListener("click", () => setFold(!cal.classList.contains("is-folded")));
    if (isWide.matches && window.innerHeight < 1000) setFold(true);
    isWide.addEventListener?.("change", (e) => {
      if (!e.matches) setFold(false);
    });

    render();
    cal.classList.add("is-ready");
  }

  // ─── DỊCH VỤ: HÀNG CHỌN (tab) ─────────────────────────
  $$("[data-tabs]").forEach((box) => {
    const list = $("[data-tablist]", box);
    const tabs = $$("[data-tab]", box);
    const panels = $$("[data-panel]", box);
    if (!list || !tabs.length) return;
    list.hidden = false;
    list.setAttribute("role", "tablist");
    tabs.forEach((t) => t.setAttribute("role", "tab"));
    panels.forEach((p) => {
      p.setAttribute("role", "tabpanel");
      p.setAttribute("tabindex", "0");
      p.setAttribute("aria-labelledby", p.id.replace("panel", "tab"));
    });
    function select(i, focus) {
      tabs.forEach((t, j) => {
        t.setAttribute("aria-selected", String(i === j));
        t.tabIndex = i === j ? 0 : -1;
      });
      panels.forEach((p, j) => {
        p.classList.toggle("is-active", i === j);
        p.classList.toggle("is-switched", i === j);
      });
      if (focus) tabs[i].focus();
      tabs[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
    tabs.forEach((t, i) => t.addEventListener("click", () => select(i, false)));
    list.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select((keys[e.key] + tabs.length) % tabs.length, true);
    });
  });

  // "Hỏi lịch cho …" → chọn sẵn loại sự kiện và ghi chú dịch vụ vào lời nhắn
  const typeInput = $("[data-type-input]");
  const msgInput = $("[data-msg-input]");
  $$("[data-ask]").forEach((a) => {
    a.addEventListener("click", () => {
      if (typeInput && a.dataset.ask) {
        typeInput.value = a.dataset.ask;
        flash(typeInput);
      }
      if (msgInput && !msgInput.value.trim() && a.dataset.askNote) {
        msgInput.value = `Tôi quan tâm dịch vụ: ${a.dataset.askNote}.`;
        flash(msgInput);
      }
    });
  });

  // ─── THU GỌN / MỞ RỘNG ("Xem thêm (N)") ───────────────
  $$("[data-more]").forEach((btn) => {
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    const text = $("[data-more-text]", btn);
    if (!target) return;
    btn.addEventListener("click", () => {
      const open = !target.classList.contains("is-open");
      target.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (text) text.textContent = open ? btn.dataset.labelLess : btn.dataset.labelMore;
      // Thu gọn lại → đưa người xem về đầu phần để không bị "lạc"
      if (!open) target.closest(".sec")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // ─── DẢI ẢNH: LỌC, ĐẾM, NÚT TRƯỚC/SAU ─────────────────
  const track = $("[data-track]");
  if (track) {
    const nowEl = $("[data-track-now]");
    const totalEl = $("[data-track-total]");
    const visible = () => $$(".shot", track).filter((li) => !li.hidden);
    const step = () => {
      const first = visible()[0];
      return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || "12") : track.clientWidth;
    };
    let ticking = false;
    function count() {
      ticking = false;
      const items = visible();
      const i = Math.min(items.length - 1, Math.round(track.scrollLeft / step()));
      if (nowEl) nowEl.textContent = pad(Math.max(1, i + 1));
      if (totalEl) totalEl.textContent = pad(items.length);
    }
    track.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(count);
      }
    }, { passive: true });
    $$("[data-track-step]").forEach((b) =>
      b.addEventListener("click", () => track.scrollBy({ left: Number(b.dataset.trackStep) * step(), behavior: reduceMotion ? "auto" : "smooth" }))
    );

    const filterBtns = $$("[data-filter]");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        $$(".shot", track).forEach((li) => {
          li.hidden = cat !== "*" && li.dataset.category !== cat;
        });
        track.scrollTo({ left: 0 });
        count();
      });
    });

    // Máy tính: rê chuột / chọn bằng bàn phím một ảnh → ô trái hiện ảnh đó to
    if (previewImg) {
      let timer = 0;
      const preview = (btn) => {
        if (!isWide.matches) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          $$(".shot__btn.is-previewing", track).forEach((b) => b.classList.remove("is-previewing"));
          btn.classList.add("is-previewing");
          previewImg.hidden = false;
          showSlide(`preview:${btn.dataset.pane}`);
        }, 160);
      };
      $$(".shot__btn", track).forEach((btn) => {
        btn.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && preview(btn));
        btn.addEventListener("focus", () => preview(btn));
      });
      track.addEventListener("pointerleave", () => clearTimeout(timer));
    }
  }

  // ─── HỘP THOẠI CHUNG ──────────────────────────────────
  /** Mở <dialog> dạng modal, khóa cuộn trang, trả focus về nút đã bấm khi đóng */
  function setupDialog(dlg, onClose) {
    let opener = null;
    dlg.addEventListener("close", () => {
      document.body.classList.remove("is-locked");
      onClose?.();
      opener?.focus();
    });
    // Bấm ra vùng nền ngoài nội dung → đóng
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
    return function open(from) {
      opener = from || document.activeElement;
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
      document.body.classList.add("is-locked");
    };
  }

  // ─── LIGHTBOX ẢNH ─────────────────────────────────────
  const lightbox = $("#lightbox");
  if (lightbox) {
    const img = $("[data-img]", lightbox);
    const cap = $("[data-caption]", lightbox);
    const countEl = $("[data-count]", lightbox);
    const isPhone = window.matchMedia("(max-width: 767px)");
    let items = [];
    let index = 0;
    const open = setupDialog(lightbox, () => img.removeAttribute("src"));

    function show(i) {
      index = (i + items.length) % items.length;
      const btn = items[index];
      img.src = (isPhone.matches && btn.dataset.lightboxM) || btn.dataset.lightbox;
      img.alt = btn.dataset.alt || "";
      cap.textContent = btn.dataset.alt || "";
      countEl.textContent = `${pad(index + 1)} / ${pad(items.length)}`;
    }

    $$("[data-lightbox]").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Chỉ chuyển giữa các ảnh đang hiện (theo bộ lọc)
        items = $$("[data-lightbox]").filter((b) => !b.closest("[hidden]"));
        show(Math.max(0, items.indexOf(btn)));
        open(btn);
      });
    });
    $("[data-prev]", lightbox).addEventListener("click", () => show(index - 1));
    $("[data-next]", lightbox).addEventListener("click", () => show(index + 1));
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    // Vuốt ngang trên điện thoại để chuyển ảnh
    const stage = $("[data-stage]", lightbox);
    let x0 = null;
    let y0 = null;
    stage.addEventListener("pointerdown", (e) => {
      x0 = e.clientX;
      y0 = e.clientY;
    });
    stage.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    });
    stage.addEventListener("pointercancel", () => (x0 = y0 = null));
  }

  // ─── TRÌNH PHÁT VIDEO ─────────────────────────────────
  const player = $("#player");
  if (player) {
    const screen = $("[data-player]", player);
    const title = $("[data-video-title]", player);
    const note = $("[data-missing-note]", player);
    const open = setupDialog(player, () => screen.replaceChildren());

    /** Link YouTube → link nhúng (youtube-nocookie); file .mp4/.webm → null (dùng thẻ <video>) */
    function toEmbed(url) {
      try {
        const u = new URL(url, location.href);
        let id = "";
        if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
        else if (u.hostname.includes("youtube")) {
          id = u.searchParams.get("v") || (u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/) || [])[2] || "";
        }
        if (id) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
      } catch {
        /* link lạ → thử phát như file */
      }
      return null;
    }

    $$("[data-video], [data-video-missing]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.video;
        title.textContent = btn.dataset.title || "";
        screen.replaceChildren();
        note.hidden = Boolean(url);
        if (url) {
          const embed = toEmbed(url);
          if (embed) {
            const f = document.createElement("iframe");
            f.src = embed;
            f.title = btn.dataset.title || "Video";
            f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
            f.allowFullscreen = true;
            screen.appendChild(f);
          } else {
            const v = document.createElement("video");
            v.src = url;
            v.controls = true;
            v.autoplay = true;
            v.playsInline = true;
            screen.appendChild(v);
          }
        }
        open(btn);
      });
    });
    $("[data-close-link]", player)?.addEventListener("click", () => player.close());
  }

  // ─── NÚT NỔI ──────────────────────────────────────────
  // Hiện khi đã cuộn qua màn hình đầu, ẩn khi đang xem phần Đặt lịch hoặc đang mở bảng lịch
  let pastHero = false;
  let atContact = false;
  function syncFab() {
    fab?.classList.toggle("is-shown", pastHero && !atContact && !deskOpen);
  }
  const heroEl = $("#hero");
  const contactEl = $("#contact");
  if (fab && "IntersectionObserver" in window) {
    if (heroEl) {
      new IntersectionObserver(([e]) => {
        pastHero = !e.isIntersecting;
        syncFab();
      }, { rootMargin: "0px 0px -40% 0px" }).observe(heroEl);
    }
    if (contactEl) {
      new IntersectionObserver(([e]) => {
        atContact = e.isIntersecting;
        syncFab();
      }, { rootMargin: "0px 0px -30% 0px" }).observe(contactEl);
    }
  } else if (fab) {
    fab.classList.add("is-shown");
  }

  // ─── PHIẾU ĐẶT LỊCH ───────────────────────────────────
  const form = $("#contact-form");
  if (form) {
    const status = $("[data-form-status]", form);
    const say = (msg, isError) => {
      status.textContent = msg;
      status.classList.toggle("is-error", Boolean(isError));
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstBad = null;
      $$("[required]", form).forEach((input) => {
        const bad = !input.value.trim() || !input.checkValidity();
        input.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) {
        say("Vui lòng điền đúng họ tên và số điện thoại.", true);
        firstBad.focus();
        return;
      }
      const data = new FormData(form);
      const email = form.dataset.email;
      if (!email) {
        say("Email chưa được cài đặt — vui lòng bấm Gọi ngay hoặc Nhắn Zalo ở trên.", true);
        return;
      }
      const date = String(data.get("date") || "");
      const subject = `Đặt lịch MC — ${data.get("eventType") || "Sự kiện"}${date ? ` — ${date.split("-").reverse().join("/")}` : ""}`;
      const body = [
        `Họ tên: ${data.get("name")}`,
        `Điện thoại: ${data.get("phone")}`,
        `Loại sự kiện: ${data.get("eventType") || ""}`,
        `Ngày tổ chức: ${date ? date.split("-").reverse().join("/") : "chưa chọn"}`,
        "",
        `${data.get("message") || ""}`,
      ].join("\n");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say("Đang mở ứng dụng email của bạn…");
    });
    $$("[required]", form).forEach((input) =>
      input.addEventListener("input", () => input.removeAttribute("aria-invalid"))
    );
  }
})();
