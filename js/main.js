document.addEventListener('DOMContentLoaded', () => {
  /* ===== Mobile nav toggle ===== */
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.accordion-item').forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ===== Testimonials carousel ===== */
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (track && prevBtn && nextBtn) {
    const cards = Array.from(track.children);
    let index = 0;

    const update = () => {
      const cardWidth = cards[0].getBoundingClientRect().width + 24;
      track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    };

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % cards.length;
      update();
    });

    prevBtn.addEventListener('click', () => {
      index = (index - 1 + cards.length) % cards.length;
      update();
    });
  }
});
