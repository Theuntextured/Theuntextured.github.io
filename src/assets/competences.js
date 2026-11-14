// Progressive enhancement: without JavaScript both groups remain readable.
const switcher = document.querySelector('[data-group-switcher]');
if (switcher) {
  const buttons = [...switcher.querySelectorAll('[data-content-group]')];
  const select = (group) => {
    for (const button of buttons) {
      const active = button.dataset.contentGroup === group;
      button.setAttribute('aria-pressed', String(active));
      document.getElementById(button.getAttribute('aria-controls')).hidden =
        !active;
    }
  };
  for (const button of buttons) {
    button.addEventListener('click', () => select(button.dataset.contentGroup));
  }
  select(buttons[0].dataset.contentGroup);
  switcher.hidden = false;
}
