export type ChatMessage = {
    t: "user" | "agent" | "company";
    text: string;
    // Who wrote a company message, shown above it in the user's chat.
    from?: string;
    reaction?: { emoji: string; label: string };
};

export type CompanyView = {
    co: { name: string; domain: string; color: string; logo: string };
    headline?: string;
    messages?: ["agent" | "user" | "company", string][];
    rows: [string, string][];
};

export type Walkthrough = {
    id: string;
    title: string;
    // A short list of the protocol features the example shows, for its tab.
    shows: string;
    summary: string;
    steps: {
        time: string;
        title: string;
        caption: string;
        chat: ChatMessage[];
        // When set, the step opens on the company's sign-in page. `reason` says why Atlas asks.
        signIn?: { reason: string; view: CompanyView };
        company: CompanyView;
        wire: { dir: string; kind: string; body: string }[];
    }[];
};
