export interface AssertionResultInterface {
    name?: string;
    pass?: boolean;
    message?: string;
    received?: unknown;
    expected?: unknown;
    [key: string]: unknown;
}
