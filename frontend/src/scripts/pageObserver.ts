/**
 * pageObserver.ts
 *
 * Watches each .snapPage inside #snapShell with IntersectionObserver.
 * When a page reaches ≥60% visibility it gets the .isActive class,
 * triggering the [data-reveal] animations. The active nav link is
 * also updated to reflect the current visible section.
 */

const snapShell = document.getElementById("snapShell") as HTMLElement | null;

if (snapShell) {
  const pages = Array.from(
    snapShell.querySelectorAll<HTMLElement>(".snapPage")
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.6) {
          // Only one page is active at a time
          pages.forEach((p) => p.classList.remove("isActive"));
          entry.target.classList.add("isActive");

          // Sync nav active link
          const activeId = (entry.target as HTMLElement).id;
          document
            .querySelectorAll<HTMLAnchorElement>(".navbar-links a")
            .forEach((link) => {
              link.classList.remove("nav-active");
              if (link.getAttribute("href") === `#${activeId}`) {
                link.classList.add("nav-active");
              }
            });
        }
      });
    },
    {
      root: snapShell,
      threshold: [0.2, 0.4, 0.6, 0.8],
    }
  );

  pages.forEach((page) => observer.observe(page));

  // Activate the first page immediately on load
  if (pages[0]) {
    pages[0].classList.add("isActive");
  }
}
