import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { getUserFromHeaders } from '@/lib/auth';

export async function GET(_request: Request, ctx: RouteContext<'/api/products/[id]'>) {
  try {
    const { id } = await ctx.params;

    const client = await clientPromise;
    const db = client.db();

    const products = await db
      .collection('products')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        { $project: { 'seller.password': 0 } },
      ])
      .toArray();

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: RouteContext<'/api/products/[id]'>) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (user.role === 'seller' && product.sellerId.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.basePrice) {
      updateData.basePrice = Number(body.basePrice);
      updateData.platformPrice = Math.round(Number(body.basePrice) * 1.15);
    }
    if (body.category) updateData.category = body.category;
    if (body.craftType) updateData.craftType = body.craftType;
    if (body.images) updateData.images = body.images;
    if (body.status && user.role === 'admin') updateData.status = body.status;
    if (body.tags) updateData.tags = body.tags;

    await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: RouteContext<'/api/products/[id]'>) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (user.role === 'seller' && product.sellerId.toString() !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
