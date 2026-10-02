// Shows that the spec is a draft and when the docs content last changed. next.config.ts sets the
// date at build time.
export function DocStatus() {
    const updated = process.env.NEXT_PUBLIC_DOCS_UPDATED;
    const label = process.env.NEXT_PUBLIC_DOCS_UPDATED_LABEL;
    return (
        <div className="doc-status">
            <span className="draft-badge">Draft 0.1</span>
            {updated && label ? (
                <span className="doc-updated">
                    Updated <time dateTime={updated}>{label}</time>
                </span>
            ) : null}
        </div>
    );
}
