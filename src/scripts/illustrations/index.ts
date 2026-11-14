// Desktop-only illustrations. Markup + styles live in /public/illustrations/<name>.html and the
// animation script is its own chunk, so nothing is requested below the desktop breakpoint.
const loaders: Record<string, () => Promise<unknown>> = {
  'property-check': () => import('./property-check.js'),
  regulations: () => import('./regulations.js'),
  platform: () => import('./platform.js'),
};

const desktop = window.matchMedia('(min-width: 768px)');
const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-illustration]'));

async function load(host: HTMLElement) {
  if (host.dataset.loaded) return;
  host.dataset.loaded = 'true';
  const name = host.dataset.illustration!;
  try {
    const res = await fetch(`/illustrations/${name}.html`);
    if (!res.ok) return;
    host.innerHTML = await res.text();
    await loaders[name]?.();
  } catch {
    host.dataset.loaded = '';
  }
}

function check() {
  if (desktop.matches) hosts.forEach(load);
}
check();
desktop.addEventListener('change', check);
