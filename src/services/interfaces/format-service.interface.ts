import type { FunctionLikeType } from '@interfaces/function.interface';

export interface HintOptionsInterface {
    isNot?: boolean;
    promise?: string;
    comment?: string;
    secondArgument?: string;
    isDirectExpectCall?: boolean;
    receivedColor?: FunctionLikeType<string, Array<string>>;
    expectedColor?: FunctionLikeType<string, Array<string>>;
    secondArgumentColor?: FunctionLikeType<string, Array<string>>;
}
