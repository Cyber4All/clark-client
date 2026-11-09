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

/** Trim text nodes, not the HTML string, so preview headings and tags stay intact. */
export function ratingCommentPreviewHtml(html: string): string {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    template.content
        .querySelectorAll("script, style, template")
        .forEach((node) => node.remove());
    let remaining = RATING_PREVIEW_LIMIT;
    // Keep this set aligned with ratingCommentText so previews and counters agree
    // on which elements contribute a newline.
    const blocks = new Set([
        "P",
        "DIV",
        "LI",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "BLOCKQUOTE",
    ]);

    // Once the budget is exhausted, discard remaining siblings while preserving
    // the already-open elements so the browser closes the preview's tags safely.
    let truncated = false;
    const trim = (parent: Node, closingBlocks = 0): void => {
        for (const node of Array.from(parent.childNodes)) {
            // Each open block will contribute a newline when counted. Only the
            // final newline is stripped, so reserve the others before taking text.
            const available = Math.max(
                0,
                remaining - Math.max(0, closingBlocks - 1),
            );
            if (truncated || available === 0) {
                parent.removeChild(node);
                truncated = true;
                continue;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const characters = Array.from(node.textContent || "");
                node.textContent = characters.slice(0, available).join("");
                remaining -= Math.min(characters.length, available);
                truncated = characters.length > available;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                trim(node, closingBlocks + (blocks.has(node.nodeName) ? 1 : 0));
                // Match the line-break accounting used by ratingCommentText.
                if (node.nodeName === "BR" || blocks.has(node.nodeName)) {
                    remaining = Math.max(0, remaining - 1);
                }
            }
        }
    };
    trim(template.content);
    if (ratingCommentLength(html) > RATING_PREVIEW_LIMIT) {
        // Keep the marker in the final text's formatting, not after a block-level
        // wrapper. Remove trailing breaks/empty blocks so it stays beside the text.
        const walker = document.createTreeWalker(
            template.content,
            NodeFilter.SHOW_TEXT,
        );
        let lastText: Node | null = null;
        while (walker.nextNode()) {
            if (walker.currentNode.textContent?.trim())
                lastText = walker.currentNode;
        }
        if (lastText) {
            const tail = document.createRange();
            tail.setStartAfter(lastText);
            tail.setEnd(template.content, template.content.childNodes.length);
            tail.deleteContents();
            lastText.textContent = lastText.textContent.trimEnd() + "…";
        } else {
            template.content.append("…");
        }
    }
    // Serialize through the DOM to keep literal '<' characters escaped. Callers
    // must still use Angular's normal innerHTML binding, never bypass sanitization.
    return template.innerHTML;
}
