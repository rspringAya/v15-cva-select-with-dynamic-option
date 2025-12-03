
export const isEmpty = (
    value: unknown,
    valuesConsideredEmpty?: (number | string)[]
): boolean => {
    if (
        value === null ||
        value === undefined ||
        value === 'undefined' ||
        value === 'null'
    ) {
        return true;
    }

    if (typeof value === 'string') {
        return (
            (!value.length ||
                (valuesConsideredEmpty &&
                    valuesConsideredEmpty
                        .filter((v) => typeof v === 'string')
                        .includes(value))) ??
            false
        );
    }

    if (typeof value === 'boolean') {
        return false;
    }

    if (Array.isArray(value)) {
        return (
            !value.length ||
            !value.some((v) => !isEmpty(v, valuesConsideredEmpty))
        );
    }

    if (typeof value === 'number') {
        return (
            (valuesConsideredEmpty &&
                valuesConsideredEmpty
                    .filter((v) => typeof v === 'number')
                    .includes(value)) ??
            false
        );
    }

    if (value instanceof File) {
        return !fileProperties.some(
            (p) => !isEmpty(value[p], valuesConsideredEmpty)
        );
    }

    if (
        typeof value !== 'number' &&
        !Object.values(value as { [s: string]: unknown }).some(
            (v) => !isEmpty(v, valuesConsideredEmpty)
        )
    ) {
        return true;
    }
    // Default to not empty when anything else
    return false;
};

export const isOfType = <T>(obj: any, properties: (keyof T)[]): obj is T => {
    if (
        obj === null ||
        obj === undefined ||
        typeof obj === 'number' ||
        typeof obj === 'string' ||
        typeof obj === 'boolean'
    ) {
        return false;
    }

    return properties.every((property) => property in obj);
};


export const fileProperties: (keyof File)[] = ['name', 'size', 'type'];

export const beginsWith = (
    a: string | null | undefined,
    b: string | null | undefined,
    caseSensitive: boolean = false
): boolean => {
    if ((isEmpty(b) && !isEmpty(a)) || (isEmpty(a) && !isEmpty(b))) {
        return false;
    }

    if (caseSensitive) {
        return (a ?? '').includes(b ?? '');
    } else {
        return (a ?? '').toLowerCase().includes((b ?? '').toLowerCase());
    }
};