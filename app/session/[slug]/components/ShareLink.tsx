"use client";

import { useState } from "react";

export default function ShareLink() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3.5 py-2 text-[13px] font-medium text-muted hover:text-foreground transition-colors"
    >
      {copied ? (
        <>
          <span>&#10003;</span> Copied!
        </>
      ) : (
        <>
          <span>&#128279;</span> Share Link
        </>
      )}
    </button>
  );
}
