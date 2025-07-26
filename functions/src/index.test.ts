import functionsTest from "firebase-functions-test";
import * as myFunctions from "../src/index";

const testEnv = functionsTest();

describe("getMedigapQuotes", () => {
  it("should throw unauthenticated error if no auth", async () => {
    const wrapped = testEnv.wrap(myFunctions.getMedigapQuotes);
    await expect(
      wrapped({
        data: {
          zip5: "12345",
          age: 65,
          gender: "M",
          tobacco: 0,
          plan: "A",
        },
        rawRequest: {
          rawBody: Buffer.from(""),
        } as import("firebase-functions/lib/common/providers/https").Request,
        acceptsStreaming: false,
      })
    ).rejects.toThrow();
  });
});
