import clientPromise from './mongodb';
import { hashPassword } from './auth';

// 10 Sellers
const SEED_SELLERS = [
  { name: 'Ramesh Prajapati', email: 'ramesh@example.com', phone: '+919876543210', role: 'seller', location: { village: 'Bagh', district: 'Dhar', state: 'Madhya Pradesh' }, craftType: 'Bagh Print', yearsOfExperience: 25, story: 'Generations of Bagh printing.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Lakshmi Bai Gond', email: 'lakshmi@example.com', phone: '+919876543211', role: 'seller', location: { village: 'Patangarh', district: 'Dindori', state: 'Madhya Pradesh' }, craftType: 'Gond Art', yearsOfExperience: 18, story: 'Vibrant paintings of nature.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Abdul Karim', email: 'abdul@example.com', phone: '+919876543212', role: 'seller', location: { village: 'Chanderi', district: 'Ashoknagar', state: 'Madhya Pradesh' }, craftType: 'Chanderi Weaving', yearsOfExperience: 30, story: 'Master weaver of silk.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Sunita Malviya', email: 'sunita@example.com', phone: '+919876543213', role: 'seller', location: { village: 'Datia', district: 'Datia', state: 'Madhya Pradesh' }, craftType: 'Bell Metal Craft', yearsOfExperience: 15, story: 'Ancient lost-wax casting.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Mohan Vishwakarma', email: 'mohan@example.com', phone: '+919876543214', role: 'seller', location: { village: 'Rewa', district: 'Rewa', state: 'Madhya Pradesh' }, craftType: 'Zardozi Embroidery', yearsOfExperience: 20, story: 'Intricate metallic threadwork.', giTagVerified: false, whatsappRegistered: true },
  { name: 'Shanti Devi', email: 'shanti@example.com', phone: '+919876543215', role: 'seller', location: { village: 'Maheshwar', district: 'Khargone', state: 'Madhya Pradesh' }, craftType: 'Maheshwari Weaving', yearsOfExperience: 40, story: 'Preserving Ahilya Bai tradition.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Deepak Chitrakar', email: 'deepak@example.com', phone: '+919876543216', role: 'seller', location: { village: 'Pithora', district: 'Jhabua', state: 'Madhya Pradesh' }, craftType: 'Pithora Painting', yearsOfExperience: 12, story: 'Ritualistic tribal murals.', giTagVerified: false, whatsappRegistered: true },
  { name: 'Rajendra Shilpi', email: 'rajendra@example.com', phone: '+919876543217', role: 'seller', location: { village: 'Tikamgarh', district: 'Tikamgarh', state: 'Madhya Pradesh' }, craftType: 'Brass Craft', yearsOfExperience: 35, story: 'Creating divine idols.', giTagVerified: true, whatsappRegistered: true },
  { name: 'Kamla Bheel', email: 'kamla@example.com', phone: '+919876543218', role: 'seller', location: { village: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh' }, craftType: 'Bead Work', yearsOfExperience: 10, story: 'Colorful tribal jewelry.', giTagVerified: false, whatsappRegistered: true },
  { name: 'Vijay Kumhar', email: 'vijay@example.com', phone: '+919876543219', role: 'seller', location: { village: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh' }, craftType: 'Terracotta', yearsOfExperience: 28, story: 'Earthenware from local soil.', giTagVerified: false, whatsappRegistered: true },
];

const SEED_BUYERS = Array.from({ length: 10 }).map((_, i) => ({
  name: `Buyer ${i + 1}`,
  email: `buyer${i + 1}@example.com`,
  phone: `+91980000000${i}`,
  role: 'buyer',
  location: { village: '', district: 'Bhopal', state: 'Madhya Pradesh' },
  craftType: '',
  yearsOfExperience: 0,
  story: '',
  giTagVerified: false,
  whatsappRegistered: false,
}));

// Products with videoUrls
const SEED_PRODUCTS = [
  { sellerEmail: 'ramesh@example.com', name: 'Bagh Print Cotton Saree', description: 'Exquisite Saree.', basePrice: 3500, category: 'Textiles', craftType: 'Bagh Print', images: ['/seed/bagh-saree.jpg'], videoUrl: 'https://youtube.com/shorts/bagh-saree-video', giTagged: true, status: 'active', tags: ['Bagh Print'] },
  { sellerEmail: 'lakshmi@example.com', name: 'Tree of Life Canvas', description: 'Gond tribal art.', basePrice: 5000, category: 'Paintings', craftType: 'Gond Art', images: ['/seed/gond-tree.jpg'], videoUrl: 'https://youtube.com/shorts/gond-tree', giTagged: true, status: 'active', tags: ['Gond Art'] },
  { sellerEmail: 'abdul@example.com', name: 'Chanderi Silk Saree', description: 'Woven with gold buttis.', basePrice: 8500, category: 'Textiles', craftType: 'Chanderi Weaving', images: ['/seed/chanderi-saree.jpg'], videoUrl: 'https://youtu.be/chanderi-demo', giTagged: true, status: 'active', tags: ['Chanderi'] },
  { sellerEmail: 'sunita@example.com', name: 'Bell Metal Diya', description: 'Lost-wax casting technique.', basePrice: 2000, category: 'Home Decor', craftType: 'Bell Metal Craft', images: ['/seed/bell-diya.jpg'], videoUrl: '', giTagged: true, status: 'active', tags: ['Bell Metal'] },
  { sellerEmail: 'mohan@example.com', name: 'Zardozi Clutch', description: 'Metallic threadwork.', basePrice: 3500, category: 'Accessories', craftType: 'Zardozi Embroidery', images: ['/seed/zardozi-clutch.jpg'], videoUrl: 'https://youtube.com/zardozi', giTagged: false, status: 'active', tags: ['Zardozi'] },
  { sellerEmail: 'shanti@example.com', name: 'Maheshwari Cotton Silk', description: 'Lightweight elegant drape.', basePrice: 4200, category: 'Textiles', craftType: 'Maheshwari Weaving', images: ['/seed/maheshwari.jpg'], videoUrl: '', giTagged: true, status: 'active', tags: ['Maheshwari'] },
  { sellerEmail: 'deepak@example.com', name: 'Pithora Horse Painting', description: 'Auspicious horse painting.', basePrice: 6000, category: 'Paintings', craftType: 'Pithora Painting', images: ['/seed/pithora.jpg'], videoUrl: 'https://vimeo.com/pithora', giTagged: false, status: 'active', tags: ['Pithora'] },
  { sellerEmail: 'rajendra@example.com', name: 'Brass Ganesh Idol', description: 'Divine handcrafted idol.', basePrice: 12000, category: 'Sculptures', craftType: 'Brass Craft', images: ['/seed/brass-ganesh.jpg'], videoUrl: 'https://youtube.com/brass', giTagged: true, status: 'active', tags: ['Brass'] },
  { sellerEmail: 'kamla@example.com', name: 'Tribal Bead Necklace', description: 'Colorful traditional jewelry.', basePrice: 800, category: 'Jewelry', craftType: 'Bead Work', images: ['/seed/bead.jpg'], videoUrl: '', giTagged: false, status: 'active', tags: ['Bead Work'] },
  { sellerEmail: 'vijay@example.com', name: 'Terracotta Horses', description: 'Bankura style horses.', basePrice: 1500, category: 'Home Decor', craftType: 'Terracotta', images: ['/seed/terracotta.jpg'], videoUrl: 'https://youtube.com/terracotta', giTagged: false, status: 'active', tags: ['Terracotta'] },
];

export async function seedDatabase() {
  const client = await clientPromise;
  const db = client.db();

  await db.collection('users').deleteMany({});
  await db.collection('products').deleteMany({});
  await db.collection('orders').deleteMany({});

  const hashedPassword = await hashPassword('password123');

  // Seed Admin
  await db.collection('users').insertOne({
    name: 'Admin', email: 'admin@kalakendra.com', phone: '+919876543200', password: hashedPassword, role: 'admin', avatar: '', location: { village: '', district: 'Bhopal', state: 'Madhya Pradesh' }, craftType: '', yearsOfExperience: 0, story: '', giTagVerified: false, whatsappRegistered: false, createdAt: new Date(),
  });

  // Seed Sellers
  const sellersToInsert = SEED_SELLERS.map((seller) => ({
    ...seller, password: hashedPassword, avatar: '', createdAt: new Date(),
  }));
  await db.collection('users').insertMany(sellersToInsert);

  // Seed Buyers (10 buyers)
  const buyersToInsert = SEED_BUYERS.map((buyer) => ({
    ...buyer, password: hashedPassword, avatar: '', createdAt: new Date(),
  }));
  await db.collection('users').insertMany(buyersToInsert);

  // Get mappings for relations
  const sellers = await db.collection('users').find({ role: 'seller' }).toArray();
  const sellerMap = new Map(sellers.map((s) => [s.email, s._id]));
  const buyers = await db.collection('users').find({ role: 'buyer' }).toArray();

  // Seed Products (10 products)
  const productsToInsert = SEED_PRODUCTS.map((product) => ({
    ...product,
    sellerId: sellerMap.get(product.sellerEmail),
    sellerEmail: undefined,
    platformPrice: Math.round(product.basePrice * 1.15),
    createdAt: new Date(),
  }));
  const insertedProductsResult = await db.collection('products').insertMany(productsToInsert);
  
  // Create 10 Orders
  const sampleProducts = productsToInsert.map((p, i) => ({ 
    ...p, _id: Object.values(insertedProductsResult.insertedIds)[i] 
  }));
  
  const ordersToInsert = Array.from({ length: 10 }).map((_, i) => {
    const buyer = buyers[i % buyers.length];
    const product = sampleProducts[i % sampleProducts.length];
    
    return {
      buyerId: buyer._id,
      items: [{ productId: product._id, quantity: 1, price: product.platformPrice }],
      totalAmount: product.platformPrice,
      status: ['placed', 'confirmed', 'shipped', 'delivered'][i % 4],
      shippingAddress: { line1: `House ${i}`, city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
      createdAt: new Date(),
    };
  });
  await db.collection('orders').insertMany(ordersToInsert);

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('products').createIndex({ sellerId: 1 });
  await db.collection('products').createIndex({ category: 1 });
  await db.collection('orders').createIndex({ buyerId: 1 });

  return {
    message: 'Database seeded successfully',
    users: 1 + sellersToInsert.length + buyersToInsert.length,
    products: productsToInsert.length,
    orders: ordersToInsert.length,
  };
}
