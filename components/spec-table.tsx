import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type WithChildren = ReactElement<{ children?: ReactNode }>;

function elements(children: ReactNode): WithChildren[] {
    return Children.toArray(children).filter(isValidElement) as WithChildren[];
}

// A row that labels the group of rows below it, like <tr className="group-row">.
function isGroupRow(row: WithChildren): boolean {
    const className = (row.props as { className?: string }).className ?? "";
    return className.split(" ").includes("group-row");
}

// Renders a spec table that stacks into one card per row on narrow screens.
// Each body cell, except in group rows, gets a copy of its column header, which CSS shows only when stacked.
export function SpecTable({ children }: { children: ReactNode }) {
    const sections = elements(children);
    const head = sections.find((section) => section.type === "thead");
    const headerRow = head ? elements(head.props.children)[0] : undefined;
    const labels = headerRow
        ? elements(headerRow.props.children).map((th) => th.props.children)
        : [];

    return (
        <table className="spec-table">
            {sections.map((section) => {
                if (section.type !== "tbody") {
                    return section;
                }
                return cloneElement(
                    section,
                    {},
                    elements(section.props.children).map((row) =>
                        isGroupRow(row)
                            ? row
                            : cloneElement(
                                  row,
                                  {},
                                  elements(row.props.children).map((cell, index) =>
                                      cloneElement(
                                          cell,
                                          {},
                                          <span className="cell-label" aria-hidden="true">
                                              {labels[index]}
                                          </span>,
                                          <div className="cell-value">{cell.props.children}</div>,
                                      ),
                                  ),
                              ),
                    ),
                );
            })}
        </table>
    );
}
