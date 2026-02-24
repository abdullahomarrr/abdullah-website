/**
 * navScroll.ts
 *
 * JS-controlled full-page scroll system.
 * – Exactly one section advances per scroll gesture (wheel, touch, or keyboard)
 * – Input is locked while animating — rapid scrolls are dropped, never queued
 * – Custom easeInOutCubic gives a slow, cinematic feel
 * – Handles: wheel, touch swipe, PageDown/PageUp/ArrowDown/ArrowUp,
 *            anchor href="#..." clicks, and [data-scroll-top] elements
 */

const snapShell = document.getElementById("snapShell") as HTMLElement | null;

// On mobile the snap shell is not the scroll container — native body scroll
// handles everything. All the custom scroll logic (wheel intercept, touch
// navigation, anchor preventDefault) must stay off on mobile.
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

if (snapShell && !isMobile()) {
  const DURATION = 800; // ms — tweak this to adjust overall speed
  let currentIndex = 0;
  let isAnimating = false;

  function getPages(): HTMLElement[] {
    return Array.from(snapShell!.querySelectorAll<HTMLElement>(".snapPage"));
  }

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setActive(index: number, pages: HTMLElement[]): void {
    pages.forEach((p) => p.classList.remove("isActive"));
    pages[index].classList.add("isActive");

    const id = pages[index].id;
    document
      .querySelectorAll<HTMLAnchorElement>(".navbar-links a")
      .forEach((a) => {
        a.classList.toggle("nav-active", a.getAttribute("href") === `#${id}`);
      });
  }

  function scrollToIndex(index: number): void {
    const pages = getPages();
    if (index < 0 || index >= pages.length) return;
    if (isAnimating) return;

    const startY = snapShell!.scrollTop;
    const endY = pages[index].offsetTop;

    currentIndex = index;
    setActive(index, pages);

    // Already at target
    if (Math.abs(startY - endY) < 2) return;

    isAnimating = true;
    const startTime = performance.now();

    function tick(now: number): void {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      snapShell!.scrollTop = startY + (endY - startY) * easeInOutCubic(t);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        snapShell!.scrollTop = endY;
        isAnimating = false;
      }
    }

    requestAnimationFrame(tick);
  }

  // ── Wheel (trackpad-safe) ─────────────────────────────────────────────────
  // Mac trackpad inertia fires wheel events for 1–2s after a hard swipe, with
  // deltaY starting high and continuously DECREASING. A fixed cooldown alone
  // can't cover all swipe strengths. Three layers combined:
  //
  //  1. scrollLocked  — fixed cooldown after each trigger (covers animation)
  //  2. Deceleration filter — inertia always decelerates; skip any event where
  //     absDelta < last absDelta (it's momentum, not intent)
  //  3. Idle reset — 200ms after the last event, reset the delta reference so
  //     the next intentional swipe isn't mistaken for inertia
  let lastAbsDelta = 0;
  let scrollLocked = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  snapShell.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const absDelta = Math.abs(e.deltaY);

      // Idle reset: 200ms after the last event, clear the delta reference
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        lastAbsDelta = 0;
        idleTimer = null;
      }, 200);

      // While locked or animating, keep tracking delta so the deceleration
      // check works correctly as soon as we're ready to accept input again
      if (scrollLocked || isAnimating) {
        lastAbsDelta = absDelta;
        return;
      }

      // Filter sub-threshold noise
      if (absDelta < 3) return;

      // Filter decelerating events — inertia always decreases, intentional
      // swipes are stable or increasing
      if (lastAbsDelta > 0 && absDelta < lastAbsDelta) {
        lastAbsDelta = absDelta;
        return;
      }

      lastAbsDelta = absDelta;

      // Trigger
      scrollLocked = true;
      setTimeout(() => { scrollLocked = false; }, DURATION + 50);

      const pages = getPages();
      scrollToIndex(
        e.deltaY > 0
          ? Math.min(currentIndex + 1, pages.length - 1)
          : Math.max(currentIndex - 1, 0)
      );
    },
    { passive: false }
  );

  // ── Touch ────────────────────────────────────────────────────────────────
  let touchStartY = 0;

  snapShell.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  snapShell.addEventListener(
    "touchend",
    (e) => {
      if (isAnimating) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50) return; // too small, ignore
      const pages = getPages();
      scrollToIndex(
        delta > 0
          ? Math.min(currentIndex + 1, pages.length - 1)
          : Math.max(currentIndex - 1, 0)
      );
    },
    { passive: true }
  );

  // ── Keyboard ─────────────────────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    const isNav =
      e.key === "PageDown" ||
      e.key === "PageUp" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowUp";
    if (!isNav) return;

    const active = document.activeElement;
    const inInput =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement;
    if (inInput) return;

    e.preventDefault();
    const pages = getPages();

    if (e.key === "PageDown" || e.key === "ArrowDown") {
      scrollToIndex(Math.min(currentIndex + 1, pages.length - 1));
    } else {
      scrollToIndex(Math.max(currentIndex - 1, 0));
    }
  });

  // ── Anchor clicks ─────────────────────────────────────────────────────────
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href) return;
      const targetId = href === "#" ? "hero" : href.slice(1);
      const pages = getPages();
      const idx = pages.findIndex((p) => p.id === targetId);
      if (idx !== -1) {
        e.preventDefault();
        scrollToIndex(idx);
      }
    });
  });

  // ── [data-scroll-top] ────────────────────────────────────────────────────
  document.querySelectorAll<HTMLElement>("[data-scroll-top]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToIndex(0);
    });
  });

  // ── Init — jump to section matching URL hash, or fall back to first ───────
  const initialPages = getPages();
  if (initialPages.length) {
    const hash = window.location.hash.slice(1);
    const hashIdx = hash ? initialPages.findIndex((p) => p.id === hash) : -1;
    const startIdx = hashIdx !== -1 ? hashIdx : 0;
    snapShell.scrollTop = initialPages[startIdx].offsetTop;
    setActive(startIdx, initialPages);
    currentIndex = startIdx;
  }
}
