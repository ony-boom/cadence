import SparkMD5 from "spark-md5";
import { CLIENT_NAME, SUBSONIC_API_VERSION } from "./constant";

function generateSalt(length = 6) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function buildAuthParams(username: string, password: string) {
  const salt = generateSalt();
  const token = SparkMD5.hash(password + salt);

  return {
    u: username,
    t: token,
    s: salt,
    c: CLIENT_NAME,
    v: SUBSONIC_API_VERSION,
    f: "json",
  };
}
