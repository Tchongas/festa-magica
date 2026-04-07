"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID } from "@/lib/config";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const MAX_START_TRIAL_ATTEMPTS = 20;
const START_TRIAL_RETRY_MS = 250;

function removeStartTrialQueryFlag(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("start_trial")) return;

  url.searchParams.delete("start_trial");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

export function MetaPixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!META_PIXEL_ID || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("start_trial") !== "1") return;

    let attempts = 0;
    const tryTrackStartTrial = () => {
      if (typeof window.fbq === "function") {
        window.fbq("track", "StartTrial");
        removeStartTrialQueryFlag();
        return true;
      }
      return false;
    };

    if (tryTrackStartTrial()) return;

    const timer = window.setInterval(() => {
      attempts += 1;

      if (tryTrackStartTrial() || attempts >= MAX_START_TRIAL_ATTEMPTS) {
        window.clearInterval(timer);
      }
    }, START_TRIAL_RETRY_MS);

    return () => window.clearInterval(timer);
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
