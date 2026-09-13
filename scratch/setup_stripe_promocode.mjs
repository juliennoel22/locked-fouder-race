import fs from "fs";

let stripeKey = process.env.STRIPE_SECRET_KEY || "";
if (!stripeKey && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    if (line.startsWith("STRIPE_SECRET_KEY=")) {
      stripeKey = line.split("=")[1].trim();
      break;
    }
  }
}

async function stripeReq(endpoint, method = "GET", bodyObj = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      ...(bodyObj ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
  };
  if (bodyObj) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(bodyObj)) {
      params.append(k, v);
    }
    options.body = params.toString();
  }
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe API Error [${res.status}] on ${endpoint}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  try {
    const coupon = await stripeReq("coupons/FOUNDERRACE");
    console.log("Coupon FOUNDERRACE status:", coupon.id);
  } catch (err) {
    console.error(err);
  }
}

main();
