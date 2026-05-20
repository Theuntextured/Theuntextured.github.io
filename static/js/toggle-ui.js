/**
 * Single-button light/dark theme toggle (sun in light mode, moon in dark mode).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function resolveTheme(stored) {
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return systemTheme();
  }

  function currentTheme() {
    var applied = document.documentElement.getAttribute('data-bs-theme');
    if (applied === 'light' || applied === 'dark') {
      return applied;
    }
    return resolveTheme(getStored());
  }

  function applyTheme(theme) {
    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.removeAttribute('data-theme-auto');
    setStored(theme);
    syncButtons(theme);
    window.setTimeout(function () {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }

  function syncButtons(theme) {
    var isDark = theme === 'dark';
    document.querySelectorAll('.cv-theme-toggle-btn').forEach(function (btn) {
      var icon = btn.querySelector('.cv-theme-toggle-btn__icon');
      if (icon) {
        icon.textContent = isDark ? '🌙' : '☀';
      }
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        isDark
          ? btn.getAttribute('data-label-dark') || 'Dark mode'
          : btn.getAttribute('data-label-light') || 'Light mode'
      );
    });
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function init() {
    var stored = getStored();
    if (stored === 'auto') {
      setStored(systemTheme());
    }
    applyTheme(resolveTheme(getStored()));

    document.querySelectorAll('.cv-theme-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  }

  /* Run before paint when possible (same as theme color-modes.js). */
  var stored = getStored();
  if (stored === 'auto') {
    setStored(systemTheme());
  }
  var initial = resolveTheme(getStored());
  document.documentElement.setAttribute('data-bs-theme', initial);
  document.documentElement.removeAttribute('data-theme-auto');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
