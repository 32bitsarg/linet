/** DOM overlay helpers for readable menus (positioned over the Phaser canvas). */

export function clearOverlay(): void {
  document.getElementById("linet-ui")?.remove();
}

export function mountOverlay(html: string): HTMLElement {
  clearOverlay();
  const root = document.createElement("div");
  root.id = "linet-ui";
  root.innerHTML = html;
  document.body.appendChild(root);
  syncOverlayToCanvas();
  window.addEventListener("resize", syncOverlayToCanvas);
  return root;
}

export function syncOverlayToCanvas(): void {
  const root = document.getElementById("linet-ui");
  const canvas = document.querySelector("#game canvas") as HTMLCanvasElement | null;
  if (!root || !canvas) return;
  const r = canvas.getBoundingClientRect();
  root.style.left = `${r.left}px`;
  root.style.top = `${r.top}px`;
  root.style.width = `${r.width}px`;
  root.style.height = `${r.height}px`;
}

export function bindOverlayCleanup(scene: {
  events: { once: (event: string, fn: () => void) => void };
}): void {
  const cleanup = () => {
    window.removeEventListener("resize", syncOverlayToCanvas);
    clearOverlay();
  };
  scene.events.once("shutdown", cleanup);
  scene.events.once("destroy", cleanup);
}
