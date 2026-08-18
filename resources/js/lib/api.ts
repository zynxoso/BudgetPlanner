type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function getXsrfCookie(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (!match) {
        return null;
    }
    try {
        return decodeURIComponent(match[2]);
    } catch {
        return match[2];
    }
}

function getCsrfToken(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    return meta?.content ?? null;
}

function parseJsonSafely(text: string): JsonValue | null {
    try {
        return JSON.parse(text) as JsonValue;
    } catch {
        return null;
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Request failed. Please try again.';
}

export async function postJson<T>(url: string, body: unknown, options: { signal?: AbortSignal } = {}): Promise<T> {
    const xsrfCookie = getXsrfCookie();
    const metaToken = getCsrfToken();

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (xsrfCookie) {
        headers['X-XSRF-TOKEN'] = xsrfCookie;
    } else if (metaToken) {
        headers['X-CSRF-TOKEN'] = metaToken;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(body ?? {}),
        signal: options.signal,
    });

    const text = await response.text();
    const data = parseJsonSafely(text);

    if (!response.ok) {
        if (response.status === 419) {
            throw new Error('Your session has expired. Please refresh the page and try again.');
        }

        const message = (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string')
            ? data.message
            : `Request failed (${response.status}).`;
        throw new Error(message);
    }

    return data as T;
}

export { getErrorMessage };
