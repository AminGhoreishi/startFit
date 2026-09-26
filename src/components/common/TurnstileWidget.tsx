"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          language?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ onSuccess, onExpire, onError, theme = "dark" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "";

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (
          !isMounted ||
          !window.turnstile ||
          !containerRef.current ||
          widgetIdRef.current
        ) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => {
            if (isMounted) {
              onSuccess(token);
            }
          },
          "expired-callback": () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          },
          "error-callback": () => {
            if (isMounted && onError) {
              onError();
            }
          },
        });
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        window.onloadTurnstileCallback = renderWidget;
        const scriptId = "cloudflare-turnstile-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, theme, onSuccess, onExpire, onError]);

    return (
      <div className="flex justify-center my-3 min-h-[65px] items-center">
        <div ref={containerRef} />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
