import type { MatcherService } from '@services/matcher.service';

export interface HandleFailureInterface {
    pass: boolean;
    name: string;
    params?: Array<string>;
    expected?: unknown;
    hintLabel?: string;
    handleNot?(this: MatcherService, info: Array<string>): void;
    handleInfo?(this: MatcherService, info: Array<string>): void;
}

export interface HandleDiffFailureInterface extends Omit<HandleFailureInterface, 'handleNot' | 'handleInfo'> {
    note?: string;
    handleNot?(this: MatcherService, info: Array<string>): void;
    handleInfo?(this: MatcherService, info: Array<string>): void;
}
