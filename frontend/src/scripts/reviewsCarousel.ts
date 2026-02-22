const track = document.getElementById("reviewsTrack") as HTMLElement;
const prevBtn = document.getElementById("reviewPrev") as HTMLButtonElement;
const nextBtn = document.getElementById("reviewNext") as HTMLButtonElement;

if (track && prevBtn && nextBtn) {
  let currentIndex = 0;

  function getVisibleCount(): number {
    return window.innerWidth >= 768 ? 2 : 1;
  }

  function getCardWidth(): number {
    const card = track.querySelector(".review-card") as HTMLElement;
    if (!card) return 0;
    const style = getComputedStyle(track);
    const gap = parseInt(style.gap) || 20;
    return card.offsetWidth + gap;
  }

  function getMaxIndex(): number {
    const cards = track.querySelectorAll(".review-card");
    return Math.max(0, cards.length - getVisibleCount());
  }

  function slide() {
    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      slide();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
      slide();
    }
  });

  const ro = new ResizeObserver(() => {
    if (currentIndex > getMaxIndex()) {
      currentIndex = getMaxIndex();
    }
    slide();
  });
  ro.observe(track);
}
