const crypto = require("crypto");

// Test with the new Freemius data you provided
const baseUrl = "http://api.crafely.space/payment/success";
const secretKey = "sk_A{%YB~EFkhv~y.d82W;Y]CWI^#2z3";
const expectedSignature =
  "f1f8ba0df55f7bd200ae04186783b5c895d4129e8c7b180dd2eae95eea896349";

// Try different parameter orders with the new data
const testCases = [
  // Original order from your new data
  "user_id=9648865&plan_id=33267&email=eee2332%40ad.com&pricing_id=42282&currency=usd&subscription_id=696044&billing_cycle=1&amount=49&tax=0&license_id=1766857&expiration=2025-08-31+18%3A02%3A17&quota=1",

  // Alphabetical order
  "amount=49&billing_cycle=1&currency=usd&email=eee2332%40ad.com&expiration=2025-08-31+18%3A02%3A17&license_id=1766857&plan_id=33267&pricing_id=42282&quota=1&subscription_id=696044&tax=0&user_id=9648865",

  // Different URL encoding (spaces instead of +)
  "user_id=9648865&plan_id=33267&email=eee2332@ad.com&pricing_id=42282&currency=usd&subscription_id=696044&billing_cycle=1&amount=49&tax=0&license_id=1766857&expiration=2025-08-31 18:02:17&quota=1",

  // HTTPS instead of HTTP
  "user_id=9648865&plan_id=33267&email=eee2332%40ad.com&pricing_id=42282&currency=usd&subscription_id=696044&billing_cycle=1&amount=49&tax=0&license_id=1766857&expiration=2025-08-31+18%3A02%3A17&quota=1",
];

console.log("Testing different URL formats...\n");

testCases.forEach((params, index) => {
  const testUrl = `${baseUrl}?${params}`;
  const calculatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(testUrl)
    .digest("hex");

  console.log(`Test ${index + 1}:`);
  console.log(`URL: ${testUrl}`);
  console.log(`Calculated: ${calculatedSignature}`);
  console.log(`Expected:   ${expectedSignature}`);
  console.log(`Match:      ${calculatedSignature === expectedSignature}`);
  console.log("---");
});
