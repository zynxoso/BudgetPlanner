type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function getCsrfToken(): string | null {
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
    const token = getCsrfToken();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body ?? {}),
        signal: options.signal,
    });

    const text = await response.text();
    const data = parseJsonSafely(text);

    if (!response.ok) {
        const message = (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string')
            ? data.message
            : `Request failed (${response.status}).`;
        throw new Error(message);
    }

    return data as T;
}

export { getErrorMessage };
