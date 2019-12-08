import { effect as T } from "@matechs/effect";
import * as H from "@matechs/http-client";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as R from "fp-ts/lib/Record";
import * as C from "node-libcurl";
import path from "path";

const certfile = path.join(__dirname, "../cacert-2019-11-27.pem");

export const libcurl: H.Http = {
  http: {
    request: <I, E, O>(
      method: H.Method,
      url: string,
      headers: Record<string, string>,
      body: I
    ): T.Effect<T.NoEnv, H.HttpError<E>, H.Response<O>> =>
      T.async(done => {
        const req = new C.Curl();
        const reqHead = [
          "Content-Type: application/json",
          ...pipe(
            headers,
            R.collect((k, v) => `${k}: ${v}`)
          )
        ];

        req.setOpt("URL", url);
        req.setOpt("CAINFO", certfile);
        req.setOpt("FOLLOWLOCATION", 1);
        req.setOpt("VERBOSE", 0);
        req.setOpt("SSL_VERIFYHOST", 2);
        req.setOpt("SSL_VERIFYPEER", 1);

        req.setOpt(C.Curl.option.HTTPHEADER, reqHead);

        switch (method) {
          case H.Method.POST:
            customReq("POST", req, body);
            break;
          case H.Method.PUT:
            customReq("PUT", req, body);
            break;
          case H.Method.PATCH:
            customReq("PATCH", req, body);
            break;
          case H.Method.DELETE:
            customReq("DELETE", req, body);
            break;
          default:
            break;
        }

        req
          .on("error", error => {
            done(
              E.left({
                _tag: H.HttpErrorReason.Request,
                error
              })
            );
          })
          .on("end", (statusCode, body, headers) => {
            if (statusCode >= 200 && statusCode < 300) {
              done(E.right(getResponse(statusCode, body.toString(), headers)));
            } else {
              done(
                E.left({
                  _tag: H.HttpErrorReason.Response,
                  response: getResponse(statusCode, body.toString(), headers)
                })
              );
            }
          });

        req.perform();

        return () => {
          req.close();
        };
      })
  }
};

function customReq<I>(method: string, req: C.Curl, body?: I) {
  if (body) {
    req.setOpt(C.Curl.option.POSTFIELDS, JSON.stringify(body));
  }
  req.setOpt(C.Curl.option.CUSTOMREQUEST, method);
}

function getResponse<A>(
  statusCode: number,
  bodyStr: string,
  headers: Buffer | C.HeaderInfo[]
): H.Response<A> {
  return {
    status: statusCode,
    body: parseOrUndefined(bodyStr),
    headers: getHeaders(headers)
  };
}

function getHeaders(headers: Buffer | C.HeaderInfo[]) {
  /* istanbul ignore next */
  return headers.length > 0
    ? typeof headers[0] !== "number"
      ? headers[0]
      : {}
    : {};
}

function parseOrUndefined<A>(str: string): A | undefined {
  if (str.length > 0) {
    try {
      return JSON.parse(str);
    } catch (_) {
      return undefined;
    }
  } else {
    return undefined;
  }
}
