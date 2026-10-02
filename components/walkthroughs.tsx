"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { walkthroughs } from "../content/walkthroughs";
import { trackEvent } from "../lib/analytics";
import { highlight } from "../lib/highlight";
import type { CompanyView } from "../lib/walkthrough-types";

function CompanyConsole({ view }: { view: CompanyView }) {
    return (
        <>
            <div className="lens-label">
                <span className="lens-avatar" style={{ background: view.co.color }}>
                    {view.co.logo}
                </span>
                What {view.co.name} sees
            </div>
            <div className="console">
                {view.headline && (
                    <blockquote className="console-quote">{view.headline}</blockquote>
                )}
                {view.messages && (
                    <div className="console-thread">
                        {view.messages.map(([who, text], index) => (
                            <div key={index} className={`console-msg ${who}`}>
                                <span>
                                    {who === "agent"
                                        ? "Atlas"
                                        : who === "user"
                                          ? "The user"
                                          : view.co.name}
                                </span>
                                {text}
                            </div>
                        ))}
                    </div>
                )}
                {view.rows.map(([label, value]) => (
                    <div key={label} className="console-row">
                        <span>{label}</span>
                        <b>{value}</b>
                    </div>
                ))}
            </div>
        </>
    );
}

export function Walkthroughs() {
    const [position, setPosition] = useState({ example: 0, step: 0, reachedEnd: false });
    const [showWire, setShowWire] = useState(false);
    const [signedIn, setSignedIn] = useState(false);
    const chat = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const hood = useRef<HTMLDivElement>(null);
    const wireToggle = useRef<HTMLButtonElement>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const example = walkthroughs[position.example];
    const step = example.steps[position.step];
    const isLast = position.step === example.steps.length - 1;
    const pendingSignIn = signedIn ? undefined : step.signIn;
    const messages = example.steps
        .slice(0, position.step + (pendingSignIn ? 0 : 1))
        .flatMap((item) => item.chat);

    useLayoutEffect(() => {
        if (chat.current) {
            chat.current.scrollTop = chat.current.scrollHeight;
        }
        if (hood.current) {
            hood.current.scrollTop = 0;
        }
    }, [position.example, position.step, signedIn]);

    useLayoutEffect(() => {
        if (showWire && hood.current && wireToggle.current) {
            hood.current.scrollTop = wireToggle.current.offsetTop - hood.current.offsetTop - 12;
        }
    }, [showWire]);

    useEffect(() => {
        function onKeyDown(event: globalThis.KeyboardEvent) {
            if (
                event.target instanceof Element &&
                event.target.closest("input, textarea, select, button, [contenteditable]")
            ) {
                return;
            }
            const rect = stage.current?.getBoundingClientRect();
            if (
                !rect ||
                rect.top > window.innerHeight * 0.6 ||
                rect.bottom < window.innerHeight * 0.4
            ) {
                return;
            }
            const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
            if (delta !== 0) {
                event.preventDefault();
                selectStep(Math.min(example.steps.length - 1, Math.max(0, position.step + delta)));
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    });

    function selectExample(index: number, control: "tab" | "next_example") {
        if (index !== position.example) {
            trackEvent("example_select", { example: walkthroughs[index].id, control });
        }
        setSignedIn(false);
        setPosition({ example: index, step: 0, reachedEnd: false });
    }

    function selectStep(index: number) {
        if (index !== position.step) {
            trackEvent("example_step", { example: example.id, step: index + 1 });
        }
        setSignedIn(false);
        setPosition((previous) => ({
            ...previous,
            step: index,
            reachedEnd:
                previous.reachedEnd || index === walkthroughs[previous.example].steps.length - 1,
        }));
    }

    function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let nextIndex: number;
        switch (event.key) {
            case "ArrowRight":
                nextIndex = (index + 1) % walkthroughs.length;
                break;
            case "ArrowLeft":
                nextIndex = (index + walkthroughs.length - 1) % walkthroughs.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = walkthroughs.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        selectExample(nextIndex, "tab");
        tabs.current[nextIndex]?.focus();
    }

    return (
        <>
            <div className="wt-tabs" id="wt-tabs" role="tablist" aria-label="Example">
                {walkthroughs.map((item, index) => (
                    <button
                        type="button"
                        key={item.id}
                        id={`tab-${item.id}`}
                        role="tab"
                        aria-selected={index === position.example}
                        aria-controls="walkthrough-panel"
                        tabIndex={index === position.example ? 0 : -1}
                        ref={(element) => {
                            tabs.current[index] = element;
                        }}
                        onKeyDown={(event) => navigateTabs(event, index)}
                        className={`wt-tab${index === position.example ? " active" : ""}`}
                        onClick={() => selectExample(index, "tab")}
                    >
                        <span className="wt-level">{item.shows}</span>
                        {item.title}
                    </button>
                ))}
            </div>
            <p className="wt-summary" id="wt-summary">
                {example.summary}
            </p>
            <div
                className="wt-stage"
                id="walkthrough-panel"
                role="tabpanel"
                aria-labelledby={`tab-${example.id}`}
                ref={stage}
            >
                <div className="phone-col">
                    <div className="phone">
                        <div className="phone-screen">
                            <div className="phone-status">
                                <span id="phone-time">{step.time}</span>
                                <span>5G</span>
                            </div>
                            {pendingSignIn && (
                                <div
                                    className="company-sign-in"
                                    role="region"
                                    aria-label={`${pendingSignIn.view.co.name} sign-in`}
                                >
                                    <div
                                        className="sign-in-brand"
                                        style={{ background: pendingSignIn.view.co.color }}
                                    >
                                        <span className="sign-in-logo" aria-hidden="true">
                                            {pendingSignIn.view.co.logo}
                                        </span>
                                        <strong>{pendingSignIn.view.co.name}</strong>
                                    </div>
                                    <div className="sign-in-body">
                                        <p className="sign-in-domain">
                                            {pendingSignIn.view.co.domain}
                                        </p>
                                        <h3>Sign in to your account</h3>
                                        <p>{pendingSignIn.reason}</p>
                                        <p className="sign-in-access">
                                            You're allowing Atlas to read and update your account.
                                        </p>
                                        <Button
                                            variant="primary"
                                            style={{ background: pendingSignIn.view.co.color }}
                                            onClick={() => {
                                                trackEvent("example_sign_in", {
                                                    example: example.id,
                                                    step: position.step + 1,
                                                });
                                                setSignedIn(true);
                                                requestAnimationFrame(() =>
                                                    chat.current?.focus({ preventScroll: true }),
                                                );
                                            }}
                                        >
                                            Sign in
                                        </Button>
                                        <small>Example sign-in. No account needed.</small>
                                    </div>
                                </div>
                            )}
                            <div className="phone-bar">
                                <div className="avatar">A</div>
                                <div className="title">
                                    Atlas<small>Your personal agent</small>
                                </div>
                            </div>
                            <div
                                className="chat"
                                id="chat"
                                ref={chat}
                                tabIndex={-1}
                                aria-label="Atlas conversation"
                                aria-hidden={!!pendingSignIn}
                                inert={!!pendingSignIn}
                            >
                                {messages.map((message, index) => (
                                    <div
                                        key={`${example.id}-${index}`}
                                        className={`msg ${message.t}${message.reaction ? " has-reaction" : ""}`}
                                    >
                                        {message.from && (
                                            <span className="msg-from">{message.from}</span>
                                        )}
                                        {message.text}
                                        {message.reaction && (
                                            <span
                                                className="msg-reaction"
                                                role="img"
                                                aria-label={message.reaction.label}
                                                title={message.reaction.label}
                                            >
                                                {message.reaction.emoji}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="dots" id="dots" role="group" aria-label="Walkthrough steps">
                        {example.steps.map((item, index) => (
                            <button
                                type="button"
                                key={item.title}
                                className={index === position.step ? "on" : undefined}
                                aria-label={`Step ${index + 1}`}
                                aria-current={index === position.step ? "step" : undefined}
                                onClick={() => selectStep(index)}
                            />
                        ))}
                    </div>
                    <div className="phone-controls">
                        <span />
                        <div className="step-arrows">
                            <Button
                                size="sm"
                                iconOnly
                                id="prev"
                                aria-label="Previous step"
                                title="Previous step"
                                disabled={position.step === 0}
                                onClick={() => selectStep(position.step - 1)}
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <Button
                                size="sm"
                                iconOnly
                                id="next"
                                aria-label="Next step"
                                title="Next step"
                                disabled={isLast}
                                onClick={() => selectStep(position.step + 1)}
                            >
                                <ArrowRight size={16} />
                            </Button>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            className={position.reachedEnd ? "shown" : undefined}
                            id="next-example"
                            aria-label="Next example"
                            onClick={() =>
                                selectExample(
                                    (position.example + 1) % walkthroughs.length,
                                    "next_example",
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
                <div className="hood">
                    <div className="hood-head">
                        <div className="step-count" id="step-count">
                            Step {position.step + 1} of {example.steps.length}
                        </div>
                        <h3 id="step-title">{step.title}</h3>
                        <p id="step-caption">{step.caption}</p>
                    </div>
                    <div className="hood-body" id="hood-body" ref={hood}>
                        <div className="lens lens-company" id="step-company">
                            <CompanyConsole view={pendingSignIn?.view ?? step.company} />
                        </div>
                        <button
                            type="button"
                            className="wire-toggle"
                            id="wire-toggle"
                            ref={wireToggle}
                            hidden={step.wire.length === 0}
                            aria-expanded={showWire}
                            aria-controls="wire"
                            onClick={() => {
                                if (!showWire) {
                                    trackEvent("example_details_open", {
                                        example: example.id,
                                        step: position.step + 1,
                                    });
                                }
                                setShowWire(!showWire);
                            }}
                        >
                            {showWire ? "Hide" : "Show"} request details
                        </button>
                        <div
                            className="wire"
                            id="wire"
                            hidden={!showWire || step.wire.length === 0}
                        >
                            {step.wire.map((exchange, index) => (
                                <div key={index} className="exchange">
                                    <div className="exchange-head">
                                        <span className="dir">{exchange.dir}</span>
                                        <span className="kind">{exchange.kind}</span>
                                    </div>
                                    <pre
                                        dangerouslySetInnerHTML={{
                                            __html: highlight(exchange.body),
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
