import { b64encode } from "./base64";

export const encodeToDataUrl = (mime: string, data: string): string => `data:${mime};charset=utf-8;base64,${b64encode(data)}`
var globalAbsolutizeAnchor: HTMLAnchorElement | null = null

export const getAbsoluteUrl = (relativeUrl: string): string => {
    if (!globalAbsolutizeAnchor) {
        globalAbsolutizeAnchor = document.createElement('a');
    }
    globalAbsolutizeAnchor.href = relativeUrl;

    return globalAbsolutizeAnchor.href;
}