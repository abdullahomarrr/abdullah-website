/**
 * pageObserver.ts
 *
 * Watches each .snapPage with IntersectionObserver.
 * Desktop: root = snapShell (the scroll container), threshold ≥60%.
 * Mobile:  root = null (real viewport), threshold ≥15% — sections are
 *          taller than the viewport and snapShell is not the scroller.
 */

const snapShell = document.getElementById("snapShell") as HTMLElement | null;

if (snapShell) {
  const pages = Array.from(
    snapShell.querySelectorAll<HTMLElement>(".snapPage")
  );

  let currentObserver: IntersectionObserver | null = null;

  function isMobile(): boolean {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  function syncNav(activeId: string): void {
    document
      .querySelectorAll<HTMLAnchorElement>(".navbar-links a")
      .forEach((link) => {
        link.classList.remove("nav-active");
        if (link.getAttribute("href") === `#${activeId}`) {
          link.classList.add("nav-active");
        }
      });
  }

  function createObserver(): IntersectionObserver {
    const mobile = isMobile();
    const triggerRatio = mobile ? 0.15 : 0.6;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= triggerRatio) {
            pages.forEach((p) => p.classList.remove("isActive"));
            entry.target.classList.add("isActive");
            syncNav((entry.target as HTMLElement).id);
          }
        });
      },
      {
        root: mobile ? null : snapShell,
        threshold: mobile ? [0.1, 0.15, 0.25, 0.4] : [0.2, 0.4, 0.6, 0.8],
      }
    );

    pages.forEach((page) => obs.observe(page));
    return obs;
  }

  currentObserver = createObserver();

  // Recreate observer if the user resizes across the mobile breakpoint
  window.matchMedia("(max-width: 767px)").addEventListener("change", () => {
    if (currentObserver) currentObserver.disconnect();
    currentObserver = createObserver();
  });

  // Activate the first page immediately on load
  if (pages[0]) {
    pages[0].classList.add("isActive");
  }
}
