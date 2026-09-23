// Client validation and display limits; the service must enforce its own save limit.
export const RATING_COMMENT_LIMIT = 2048;
export const RATING_PREVIEW_LIMIT = 512;

/** Preserve the editor's inline sizes when Angular strips style attributes on display. */
export function serializeRatingComment(html: string): string {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    // Browsers may emit CSS sizes even with styleWithCSS disabled. Translate only
    // our supported sizes; this is serialization, not sanitization of arbitrary HTML.
    const sizes: Record<string, string> = {
        medium: "3",
        "16px": "3",
        large: "4",
        "18px": "4",
        "x-large": "5",
        "24px": "5",
        "xx-large": "6",
        "32px": "6",
    };
    template.content
        .querySelectorAll<HTMLElement>("[style]")
        .forEach((element) => {
            const size = sizes[element.style.fontSize];
            if (!size) return;
            const font = document.createElement("font");
            font.setAttribute("size", size);
            while (element.firstChild) font.appendChild(element.firstChild);
            element.appendChild(font);
            element.style.removeProperty("font-size");
            if (!element.getAttribute("style"))
                element.removeAttribute("style");
        });
    return template.innerHTML;
}

/** Extract text for counting/previews only; HTML rendering still uses Angular sanitization. */
export function ratingCommentText(html: string): string {
    // An inert template decodes entities without executing scripts or loading images.
    const template = document.createElement("template");
    template.innerHTML = html || "";
    template.content
        .querySelectorAll("script, style, template")
        .forEach((node) => node.remove());
    template.content
        .querySelectorAll("br")
        .forEach((node) => node.replaceWith("\n"));
    template.content
        .querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, blockquote")
        // Keep block boundaries readable when formatted HTML becomes preview text.
        .forEach((node) => node.append("\n"));
    return (template.content.textContent || "").replace(/\n$/, "");
}

export function ratingCommentLength(html: string): number {
    // Count Unicode code points so an emoji is not split into two UTF-16 units.
    return Array.from(ratingCommentText(html)).length;
}

export function ratingCommentPreview(html: string): string {
    return Array.from(ratingCommentText(html))
        .slice(0, RATING_PREVIEW_LIMIT)
        .join("");
}
