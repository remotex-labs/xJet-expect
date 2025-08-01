export interface OptionsPromiseErrorInterface {
    value: unknown;
    message: string;
    hintChain: Array<string>;
    valueKind: 'Resolved' | 'Rejected' // for styling
}
