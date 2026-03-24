import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromHeaders } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const craftType = searchParams.get('craftType');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';

    const client = await clientPromise;
    const db = client.db();

    const filter: Record<string, unknown> = {};
    if (status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (craftType) filter.craftType = craftType;
    if (sellerId) filter.sellerId = new ObjectId(sellerId);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { craftType: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await db
      .collection('products')
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            'seller.password': 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, basePrice, category, craftType, images, videoUrl, tags } = body;

    if (!name || !basePrice || !category || !craftType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const product = {
      sellerId: new ObjectId(user.id),
      name,
      description: description || '',
      basePrice: Number(basePrice),
      platformPrice: Math.round(Number(basePrice) * 1.15),
      category,
      craftType,
      images: images || [],
      videoUrl: videoUrl || '',
      giTagged: ['Bagh Print', 'Gond Art', 'Chanderi Weaving', 'Bell Metal Craft'].includes(craftType),
      tags: tags || [],
      status: 'active',
      createdAt: new Date(),
    };

    const result = await db.collection('products').insertOne(product);

    return NextResponse.json({
      message: 'Product created successfully',
      product: { ...product, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
