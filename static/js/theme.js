(() => {
  const root = document.documentElement;
  // Grey is the default. Preserve a visitor's explicit choice across pages.
  let isDark = false;
  try {
    isDark = localStorage.getItem('color-theme') === 'dark';
  } catch (_) {
    // The toggle still works when Safari disables persistent storage.
  }
  root.classList.toggle('dark', isDark);

  document.addEventListener('DOMContentLoaded', () => {
    const controls = ['desktop', 'mobile'].map((size) => ({
      button: document.getElementById(`theme-toggle-button-${size}`),
      moon: document.getElementById(`theme-toggle-dark-icon-${size}`),
      sun: document.getElementById(`theme-toggle-light-icon-${size}`),
    }));

    function updateControls() {
      const label = isDark ? 'Switch to grey background' : 'Switch to deep black background';
      for (const { button, moon, sun } of controls) {
        if (!button) continue;
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
        button.setAttribute('aria-pressed', String(isDark));
        if (moon) moon.classList.toggle('hidden', isDark);
        if (sun) sun.classList.toggle('hidden', !isDark);
      }
    }

    for (const { button } of controls) {
      if (!button) continue;
      button.addEventListener('click', () => {
        isDark = !isDark;
        root.classList.toggle('dark', isDark);
        try {
          localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
        } catch (_) {}
        updateControls();
        if (window.innerWidth < 768) {
          document.getElementById('mobile-menu')?.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    }
    updateControls();
  });
})();
