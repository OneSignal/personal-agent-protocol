import type { ComponentProps } from "react";

type ButtonStyle = {
    // Ghost has no fill or border until hovered, for tools inside a toolbar.
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
    // Square button that holds only an icon. Pass an aria-label.
    iconOnly?: boolean;
};

function buttonClass(
    { variant = "secondary", size = "md", iconOnly }: ButtonStyle,
    className?: string,
) {
    return ["btn", `btn-${variant}`, `btn-${size}`, iconOnly && "btn-icon", className]
        .filter(Boolean)
        .join(" ");
}

export function Button({
    variant,
    size,
    iconOnly,
    className,
    type = "button",
    ...props
}: ButtonStyle & ComponentProps<"button">) {
    return (
        <button
            type={type}
            className={buttonClass({ variant, size, iconOnly }, className)}
            {...props}
        />
    );
}

// A link styled as a button, for navigation.
export function ButtonLink({
    variant,
    size,
    iconOnly,
    className,
    ...props
}: ButtonStyle & ComponentProps<"a">) {
    return <a className={buttonClass({ variant, size, iconOnly }, className)} {...props} />;
}
