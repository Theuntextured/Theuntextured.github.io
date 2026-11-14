// Runs before styles load so a saved dark theme does not flash light first.
(() => {
  const key = 'cv-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    preference = localStorage.getItem(key);
  } catch {
    // Browsers can block storage; use the system theme in that case.
  }
  if (!['light', 'dark'].includes(preference)) {
    preference = null;
  }
  let button;
  let animations = [];
  let generation = 0;
  const updateIcon = (dark, animate) => {
    const currentGeneration = ++generation;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    const incoming = button.querySelector(
      `[data-theme-icon="${dark ? 'sun' : 'moon'}"]`,
    );
    const outgoing = button.querySelector(
      `[data-theme-icon="${dark ? 'moon' : 'sun'}"]`,
    );
    incoming.hidden = false;
    outgoing.hidden = true;
    if (
      !animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !incoming.animate
    ) {
      return;
    }
    outgoing.hidden = false;
    const timing = { duration: 600, easing: 'ease-in-out', fill: 'both' };
    // Both icons meet at zero size halfway through one full rotation.
    animations = [
      outgoing.animate(
        [
          { transform: 'rotate(0deg) scale(1)', offset: 0 },
          { transform: 'rotate(180deg) scale(0)', offset: 0.5 },
          { transform: 'rotate(360deg) scale(0)', offset: 1 },
        ],
        timing,
      ),
      incoming.animate(
        [
          { transform: 'rotate(0deg) scale(0)', offset: 0 },
          { transform: 'rotate(180deg) scale(0)', offset: 0.5 },
          { transform: 'rotate(360deg) scale(1)', offset: 1 },
        ],
        timing,
      ),
    ];
    Promise.all(animations.map((animation) => animation.finished))
      .then(() => {
        if (generation !== currentGeneration) {
          return;
        }
        outgoing.hidden = true;
        animations.forEach((animation) => animation.cancel());
        animations = [];
      })
      .catch(() => {}); // A newer theme change cancels the previous animation.
  };
  const apply = (animate = false) => {
    const dark = (preference || (system.matches ? 'dark' : 'light')) === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    if (button) {
      const label = dark ? button.dataset.lightLabel : button.dataset.darkLabel;
      button.setAttribute('aria-label', label);
      button.title = label;
      updateIcon(dark, animate);
    }
  };
  apply();
  system.addEventListener('change', () => apply(true));
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('[data-theme-toggle]');
    if (!button) {
      return;
    }
    button.hidden = false;
    apply();
    // Enable animation only after the initial palette has painted.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.classList.add('theme-ready');
      }),
    );
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(key, preference);
      } catch {
        // Keep the selected theme for this visit when storage is blocked.
      }
      apply(true);
    });
  });
})();
