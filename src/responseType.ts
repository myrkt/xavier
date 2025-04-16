import { SWRResponse } from "swr";

export type XavierResponse<T> = Omit<SWRResponse<T>, "mutate">;
