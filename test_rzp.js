const Razorpay = require('razorpay');
const rzp = new Razorpay({
  key_id: 'rzp_test_fIHdXKFZG9UZ0w',
  key_secret: 'OFLTu1nDmfyyOjSjlOH3b4u2'
});

async function test() {
  try {
    const res = await rzp.orders.create({
      amount: 11500,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_65e0a6d0718d7c4a12345678` 
    });
    console.log(res);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
}
test();
