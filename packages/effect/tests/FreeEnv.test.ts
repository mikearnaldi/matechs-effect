import assert from "assert";
import { pipe } from "fp-ts/lib/pipeable";
import { freeEnv as F, effect as T, utils as U } from "../src";
import { done } from "../src/original/exit";

const fnEnv: unique symbol = Symbol();

const fnEnvM_ = F.define({
  [fnEnv]: {
    mapString: F.fn<(s: string) => T.UIO<string>>()
  }
});

interface FnEnv extends F.TypeOf<typeof fnEnvM_> {}

const fnEnvM = F.opaque<FnEnv>()(fnEnvM_);

const fnLive: FnEnv = {
  [fnEnv]: {
    mapString: (s) => T.pure(`(${s})`)
  }
};

const {
  [fnEnv]: { mapString }
} = F.access(fnEnvM);

const consoleEnv: unique symbol = Symbol();

const consoleM = F.define({
  [consoleEnv]: {
    log: F.fn<(s: string) => T.RIO<FnEnv, void>>(),
    get: F.cn<T.UIO<string[]>>()
  }
});

type Console = F.TypeOf<typeof consoleM>;

const {
  [consoleEnv]: { log, get }
} = F.access(consoleM);

const prefixEnv: unique symbol = Symbol();

const prefixM = F.define({
  [prefixEnv]: {
    accessPrefix: F.cn<T.UIO<string>>()
  }
});

const {
  [prefixEnv]: { accessPrefix }
} = F.access(prefixM);

const configEnv: unique symbol = Symbol();

const configM = F.define({
  [configEnv]: {
    accessConfig: F.cn<T.UIO<string>>()
  }
});

const {
  [configEnv]: { accessConfig }
} = F.access(configM);

const messages: string[] = [];
const messages2: string[] = [];

const consoleI = F.implement(consoleM)({
  [consoleEnv]: {
    log: (s) =>
      pipe(
        accessPrefix,
        T.chain((prefix) => mapString(`${prefix}${s}`)),
        T.chain((s) =>
          T.sync(() => {
            messages.push(s);
          })
        )
      ),
    get: pipe(
      accessConfig,
      T.chain((_) => T.pure(messages))
    )
  }
});

const consoleI2 = F.implement(consoleM)({
  [consoleEnv]: {
    log: (s) =>
      T.sync(() => {
        messages2.push(`${s}`);
      }),
    get: T.pure(messages2)
  }
});

const program: T.RIO<Console & FnEnv, string[]> = pipe(
  log("message"),
  T.chain((_) => get)
);

describe("Generic", () => {
  it("use generic module", async () => {
    const prefixI = F.implement(prefixM)({
      [prefixEnv]: {
        accessPrefix: T.pure("prefix: ")
      }
    });

    const main = pipe(program, consoleI, prefixI);

    assert.deepEqual(
      await T.runToPromiseExit(
        T.provide<U.Env<typeof main>>({
          ...fnLive,
          ...F.instance(configM)({
            [configEnv]: {
              accessConfig: T.pure("")
            }
          })
        })(main)
      ),
      done(["(prefix: message)"])
    );
  });

  it("use generic module (different interpreter)", async () => {
    const main = pipe(program, consoleI2);

    assert.deepEqual(await T.runToPromiseExit(T.provide(fnLive)(main)), done(["message"]));
  });

  it("use generic module (different interpreter, not need fnEnv)", async () => {
    const main = pipe(get, consoleI2);

    assert.deepEqual(await T.runToPromiseExit(main), done(["message"]));
  });
});
