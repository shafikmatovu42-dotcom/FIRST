import { useEffect, useState } from "react";
import { Download, X, Wrench } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA compliance
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("PWA Service Worker active"))
        .catch((err) => console.log("SW reg failed", err));
    }

    // 2. Check standalone mode (already installed app)
    const isInStandaloneMode =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

    setIsStandalone(Boolean(isInStandaloneMode));

    if (isInStandaloneMode) {
      return;
    }

    // Always show install notification banner on page load/reload
    setShowBanner(true);

    // 3. Listen for browser native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "To install TOOL HUB as an app:\n\n• On iPhone/iPad (Safari): Tap the Share button and select 'Add to Home Screen'.\n• On Chrome/Android: Tap menu (⋮) and select 'Install app' or 'Add to Home screen'."
      );
    }
  };

  if (!showBanner || isStandalone || installed) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-amber-500/40 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/20 text-white flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-md font-bold">
              <Wrench className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Install TOOL HUB App</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                Install TOOL HUB on your phone or PC for fast 1-tap ordering & catalog access.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss app install notification"
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/80">
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg hover:bg-amber-400 transition"
          >
            <Download className="size-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </div>
    </div>
  );
}
