/**
 * Builds nbviewer's canonical URL-provider path for a remote notebook.
 * Query parameters are encoded as a path segment so signed source URLs are
 * forwarded to the notebook host instead of being consumed by nbviewer.
 */
export function buildNotebookPreviewUrl(
    source: string,
    viewerBase: string,
): string {
    const sourceUrl = parseHttpUrl(source, "notebook source");
    const viewerUrl = parseHttpUrl(viewerBase, "notebook viewer");
    const provider = sourceUrl.protocol === "https:" ? "urls" : "url";
    const sourceQuery = sourceUrl.search
        ? `/${encodeURIComponent(sourceUrl.search)}`
        : "";

    viewerUrl.search = "";
    viewerUrl.hash = "";

    const base = viewerUrl.toString().replace(/\/+$/, "");
    return `${base}/${provider}/${sourceUrl.host}${sourceUrl.pathname}${sourceQuery}`;
}

function parseHttpUrl(value: string, label: string): URL {
    let url: URL;

    try {
        url = new URL(value);
    } catch {
        throw new Error(`Invalid ${label} URL.`);
    }

    if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
    ) {
        throw new Error(`Invalid ${label} URL.`);
    }

    return url;
}
