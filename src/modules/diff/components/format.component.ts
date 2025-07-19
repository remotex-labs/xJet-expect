export function getAlignedLabel(...labels: Array<string>): (lable: string) => string {
    const maxLength = labels.reduce(
        (max, string) => Math.max(string.length, max), 0
    );

    return (label: string) => `${ label }: `.padEnd(maxLength);
}
