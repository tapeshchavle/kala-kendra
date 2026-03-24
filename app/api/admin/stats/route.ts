import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromHeaders } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const [
      totalSellers,
      totalBuyers,
      totalProducts,
      totalOrders,
      craftTypeStats,
      recentOrders,
      recentSellers,
    ] = await Promise.all([
      db.collection('users').countDocuments({ role: 'seller' }),
      db.collection('users').countDocuments({ role: 'buyer' }),
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
      db
        .collection('products')
        .aggregate([
          { $group: { _id: '$craftType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      db
        .collection('orders')
        .aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
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
        ])
        .toArray(),
      db
        .collection('users')
        .find({ role: 'seller' })
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ password: 0 })
        .toArray(),
    ]);

    const totalRevenue = await db
      .collection('orders')
      .aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }])
      .toArray();

    return NextResponse.json({
      stats: {
        totalSellers,
        totalBuyers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        craftTypeStats,
        recentOrders,
        recentSellers,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
