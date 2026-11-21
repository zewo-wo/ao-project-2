(() => {
  'use strict';

  const config = window.SILVER_LEDGER_CONFIG || {};
  const viewNames = {
    home: 'Overview',
    market: 'Market & Crafting',
    loot: 'Loot Ledger',
    about: 'About the Hub'
  };
  const views = Object.keys(viewNames);
  const frames = {
    market: { id: 'marketFrame', url: config.marketUrl },
    loot: { id: 'lootFrame', url: config.lootUrl }
  };
  const loadedFrames = new Set();
  const navButtons = [...document.querySelectorAll('[data-view]')];
  const viewPanels = views.reduce((acc, name) => {
    acc[name] = document.getElementById(`view-${name}`);
    return acc;
  }, {});
  const breadcrumb = document.getElementById('breadcrumbCurrent');
  const sidebar = document.getElementById('sidebar');
  const mobileMenu = document.getElementById('mobileMenu');

  function loadFrame(name, forceReload = false) {
    const frameInfo = frames[name];
    if (!frameInfo || !frameInfo.url) return;
    const frame = document.getElementById(frameInfo.id);
    if (!frame) return;
    if (!loadedFrames.has(name) || forceReload) {
      frame.src = frameInfo.url;
      loadedFrames.add(name);
    }
  }

  function setView(name, remember = true) {
    if (!views.includes(name)) name = 'home';
    views.forEach((view) => {
      const active = view === name;
      viewPanels[view].classList.toggle('active', active);
      viewPanels[view].hidden = !active;
    });
    navButtons.forEach((button) => {
      const active = button.dataset.view === name;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (breadcrumb) breadcrumb.textContent = viewNames[name];
    if (remember) {
      try { localStorage.setItem('silverLedgerPortalLastView', name); } catch (_) { /* storage may be disabled */ }
    }
    if (name === 'market' || name === 'loot') loadFrame(name);
    sidebar.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
  document.querySelectorAll('[data-open-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.openView));
  });
  document.querySelectorAll('[data-view-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setView(link.dataset.viewLink);
    });
  });
  document.querySelectorAll('[data-refresh-frame]').forEach((button) => {
    button.addEventListener('click', () => loadFrame(button.dataset.refreshFrame, true));
  });

  mobileMenu?.addEventListener('click', () => {
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      sidebar.classList.remove('open');
      mobileMenu?.setAttribute('aria-expanded', 'false');
    }
  });

  const marketExternal = document.getElementById('marketExternal');
  const lootExternal = document.getElementById('lootExternal');
  if (marketExternal) marketExternal.href = config.marketUrl || '#';
  if (lootExternal) lootExternal.href = config.lootUrl || '#';
  document.querySelectorAll('.topbar-link').forEach((link) => {
    if (config.githubProfile) link.href = config.githubProfile;
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  let initialView = 'home';
  try {
    const saved = localStorage.getItem('silverLedgerPortalLastView');
    if (views.includes(saved)) initialView = saved;
  } catch (_) { /* default to overview */ }
  setView(initialView, false);
})();
