import { API } from "@/lib/api";

export function track(type, extra = {}) {
  try {
    const device = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    const body = JSON.stringify({
      type,
      path: window.location.pathname || "/",
      referrer: document.referrer || "",
      device,
      ...extra,
    });
    const url = `${API}/track`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch (e) {
    /* analytics must never break the page */
  }
}
