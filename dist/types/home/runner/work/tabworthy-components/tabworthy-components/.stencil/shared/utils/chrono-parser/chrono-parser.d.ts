import { ChronoOptions, ChronoParsedDate, ChronoParsedRange } from "./chrono-parser.type";
export declare const chronoParseDate: (dateString: string, options?: ChronoOptions) => Promise<ChronoParsedDate>;
export declare const chronoParseRange: (dateString: string, options?: ChronoOptions) => Promise<ChronoParsedRange>;
