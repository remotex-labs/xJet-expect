import type { Matchers } from '@providers/matchers.provider';

export type BoundMatchersType = {
    [K in keyof typeof Matchers]: (...args: Parameters<typeof Matchers[K]>) => ReturnType<typeof Matchers[K]> | Promise<ReturnType<typeof Matchers[K]>>
};

export type PromisifiedMatchersType = {
    [K in keyof typeof Matchers]: (...args: Parameters<typeof Matchers[K]>) => Promise<ReturnType<typeof Matchers[K]>>;
};
