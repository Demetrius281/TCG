// Desktop-only connector lines for the `flow` block: sources -> hub -> outputs.
// The labels are plain HTML in the block; this only draws the lines over them.
const NS = 'http://www.w3.org/2000/svg';

function edge(el: Element, host: DOMRect, side: 'l' | 'r') {
  const r = el.getBoundingClientRect();
  return { x: (side === 'l' ? r.left : r.right) - host.left, y: r.top + r.height / 2 - host.top };
}

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
}

export function drawFlow(host: HTMLElement) {
  const hub = host.querySelector('[data-flow-hub]');
  const sources = Array.from(host.querySelectorAll('[data-flow-src]'));
  const outs = Array.from(host.querySelectorAll('[data-flow-out]'));
  if (!hub) return;
  let svg = host.querySelector<SVGSVGElement>('.flow-lines');
  if (!svg) {
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'flow-lines');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    host.prepend(svg);
  }
  const render = () => {
    const box = host.getBoundingClientRect();
    svg!.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg!.replaceChildren();
    const add = (d: string, cls: string, i: number) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('pathLength', '1');
      p.setAttribute('class', `${cls} d${i}`);
      svg!.appendChild(p);
    };
    const hl = edge(hub, box, 'l');
    const hr = edge(hub, box, 'r');
    sources.forEach((s, i) => add(curve(edge(s, box, 'r'), hl), 'in', i));
    outs.forEach((o, i) => add(curve(hr, edge(o, box, 'l')), 'out', i));
  };
  render();
  new ResizeObserver(render).observe(host);
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      host.classList.add('drawn');
      setTimeout(() => host.classList.add('settled'), 3000);
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(host);
}
