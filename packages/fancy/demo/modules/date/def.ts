import { effect as T, freeEnv as F } from "@matechs/effect";

// alpha
/* istanbul ignore file */

export const dateOpsURI = Symbol();

export interface DateOps extends F.ModuleShape<DateOps> {
  [dateOpsURI]: {
    updateDate: T.Sync<Date>;
    accessDate: T.Sync<Date>;
  };
}

export const dateOpsSpec = F.define<DateOps>({
  [dateOpsURI]: {
    updateDate: F.cn(),
    accessDate: F.cn()
  }
});

export const { updateDate, accessDate } = F.access(dateOpsSpec)[dateOpsURI];
