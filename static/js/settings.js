(() => {
  const controls = Array.from(document.querySelectorAll('[data-settings-control]'));
  const switches = Array.from(document.querySelectorAll('[data-background-animation-switch]'));
  const storageKey = 'background-animation';

  function readPreference() {
    try {
      return localStorage.getItem(storageKey) !== 'off';
    } catch (_) {
      return true;
    }
  }

  function setAnimationEnabled(enabled, persist = true) {
    for (const toggle of switches) {
      toggle.setAttribute('aria-checked', String(enabled));
      const control = toggle.closest('[data-settings-control]');
      const status = control?.querySelector('[data-animation-status]');
      if (status) status.textContent = enabled ? 'On' : 'Off';
    }
    if (persist) {
      try {
        localStorage.setItem(storageKey, enabled ? 'on' : 'off');
      } catch (_) {
        // The current page still honors the setting when storage is unavailable.
      }
    }
    window.dispatchEvent(new CustomEvent('background-animation-change', { detail: { enabled } }));
  }

  function closeControl(control, restoreFocus = false) {
    const button = control.querySelector('[data-settings-toggle]');
    const panel = control.querySelector('[data-settings-panel]');
    if (!button || !panel) return;
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus();
  }

  for (const control of controls) {
    const button = control.querySelector('[data-settings-toggle]');
    const panel = control.querySelector('[data-settings-panel]');
    const toggle = control.querySelector('[data-background-animation-switch]');
    if (!button || !panel || !toggle) continue;

    button.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      for (const other of controls) closeControl(other);
      panel.hidden = !shouldOpen;
      button.setAttribute('aria-expanded', String(shouldOpen));
    });

    toggle.addEventListener('click', () => {
      setAnimationEnabled(toggle.getAttribute('aria-checked') !== 'true');
    });
  }

  document.addEventListener('click', (event) => {
    for (const control of controls) {
      if (!control.contains(event.target)) closeControl(control);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openControl = controls.find((control) => !control.querySelector('[data-settings-panel]')?.hidden);
    if (openControl) {
      event.preventDefault();
      closeControl(openControl, true);
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) setAnimationEnabled(event.newValue !== 'off', false);
  });

  setAnimationEnabled(readPreference(), false);
})();
