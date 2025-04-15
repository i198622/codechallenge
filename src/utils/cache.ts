/* eslint-disable @typescript-eslint/no-explicit-any */

import { createCache } from "simple-in-memory-cache";

export interface IRepo {
  [key: string]: any;
}

export const cache = createCache<IRepo>({ expiration: { weeks: 1 } });
