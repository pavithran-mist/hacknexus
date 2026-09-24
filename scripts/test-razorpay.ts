async function testRazorpay() {
  const keyId = "rzp_test_TfvPvr7oVqrINI";
  const keySecret = "wWA2P4n0PVxNuHvOk9S5zkve";

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: 49900, // 499 INR in paise
      currency: "INR",
      receipt: `test_rcpt_${Date.now()}`,
    }),
  });

  const data = await res.json();
  console.log("Razorpay API Response Status:", res.status);
  console.log("Razorpay Order Created Successfully:", data.id ? true : false);
  console.log("Order Details:", JSON.stringify(data, null, 2));
}

testRazorpay().catch(console.error);
