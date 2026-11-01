import { readSessionToken } from "./cookie";

describe("readSessionToken", () => {
  const token = "a".repeat(43);

  it("reads only the exact application session cookie", () => {
    expect(readSessionToken(`other=value; ido_grow_session=${token}`)).toBe(token);
  });

  it("rejects missing or malformed session cookies", () => {
    expect(readSessionToken(undefined)).toBeNull();
    expect(readSessionToken("ido_grow_session=too-short")).toBeNull();
    expect(readSessionToken(`wrong_name=${token}`)).toBeNull();
  });
});
