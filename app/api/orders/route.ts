import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromHeaders } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    let filter: Record<string, unknown> = {};
    if (user.role === 'buyer') {
      filter.buyerId = new ObjectId(user.id);
    } else if (user.role === 'seller') {
      // Get orders that contain this seller's products
      const sellerProducts = await db
        .collection('products')
        .find({ sellerId: new ObjectId(user.id) })
        .project({ _id: 1 })
        .toArray();
      const productIds = sellerProducts.map((p) => p._id);
      filter['items.productId'] = { $in: productIds };
    }

    const orders = await db
      .collection('orders')
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'buyerId',
            foreignField: '_id',
            as: 'buyer',
          },
        },
        { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },
        { $project: { 'buyer.password': 0 } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user || user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch product details and calculate total
    const productIds = items.map((item: { productId: string }) => new ObjectId(item.productId));
    const products = await db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray();

    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return {
        productId: new ObjectId(item.productId),
        productName: product?.name || 'Unknown',
        quantity: item.quantity,
        price: product?.platformPrice || 0,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const order = {
      buyerId: new ObjectId(user.id),
      items: orderItems,
      totalAmount,
      status: 'placed',
      shippingAddress: shippingAddress || {},
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(order);

    return NextResponse.json({
      message: 'Order placed successfully',
      order: { ...order, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
