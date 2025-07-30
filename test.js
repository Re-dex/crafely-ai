const crypto = require("crypto");
const url =
  "http://api.crafely.space/payment/success?user_id=4957262&plan_id=32864&email=user%40gmail.com&pricing_id=41706&currency=usd&subscription_id=696029&billing_cycle=12&amount=50&tax=0&license_id=1766839&expiration=2026-07-31+17%3A19%3A27&quota=1";
const secretKey = "sk_p;CPouyb%9LyIz5>D&bm*_ZtP(COP";
const signature = crypto
  .createHmac("sha256", secretKey)
  .update(url)
  .digest("hex");
console.log(signature);
