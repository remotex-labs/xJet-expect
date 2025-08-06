export interface TypeInfoInterface {
    type?: string;
    value: unknown;
}

export interface OptionsTypeErrorInterface {
    name?: string;
    message: string;
    params?: Array<string>;
    hintChain: Array<string>;
    expected?: TypeInfoInterface;
    received?: TypeInfoInterface;
}
