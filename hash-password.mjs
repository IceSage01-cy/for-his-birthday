// Prints the code to paste into LOCK.passwordHash in config.js.
// Usage: npm run hash -- "his password"
import { createHash } from "node:crypto";

const password = process.argv.slice(2).join(" ");

if (!password.trim()) {
  console.log('Usage: npm run hash -- "his password"');
  process.exit(1);
}

// The same text rules as LockScreen.jsx: ignore capitals and spaces around it.
console.log(createHash("sha256").update(password.trim().toLowerCase()).digest("hex"));
