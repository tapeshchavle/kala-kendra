import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getUserFromHeaders } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: Request) {
  try {
    const user = await getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json(); // amount in INR

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now().toString().slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment order', 
      details: error?.message 
    }, { status: 500 });
  }
}
