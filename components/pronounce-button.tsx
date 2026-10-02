"use client";

import { useRef } from "react";

// A small speaker button that plays a pronunciation clip.
export function PronounceButton({ src, label }: { src: string; label: string }) {
    const audio = useRef<HTMLAudioElement>(null);

    return (
        <>
            <button
                type="button"
                className="pronounce"
                aria-label={label}
                title={label}
                onClick={() => {
                    if (audio.current) {
                        audio.current.currentTime = 0;
                        void audio.current.play();
                    }
                }}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M11 5 6 9H3v6h3l5 4V5z"></path>
                    <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
                    <path d="M19 5a10 10 0 0 1 0 14"></path>
                </svg>
            </button>
            <audio ref={audio} src={src} preload="none" />
        </>
    );
}
