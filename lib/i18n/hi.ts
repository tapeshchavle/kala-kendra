import { en } from './en';

export const hi: Record<keyof typeof en, string> = {
  // Navigation & Toggle
  switchLanguage: 'English पर जाएं',
  
  // seller/page.tsx
  sellerDashboard: 'विक्रेता डैशबोर्ड',
  welcomeBack: 'वापसी पर स्वागत है',
  addProduct: 'उत्पाद जोड़ें',
  products: 'उत्पाद',
  active: 'सक्रिय',
  orders: 'ऑर्डर',
  estRevenue: 'अनुमानित आय',
  yourProducts: 'आपके उत्पाद',
  addNew: 'नया जोड़ें',
  noProducts: 'अभी तक कोई उत्पाद नहीं है। अपना पहला शिल्प जोड़ें!',
  base: 'मूल कीमत',
  
  // seller/products/add/page.tsx
  backToDashboard: 'डैशबोर्ड पर वापस जाएं',
  addNewProduct: 'नया उत्पाद जोड़ें',
  listYourCraft: 'खरीदारों के लिए अपना शिल्प सूचीबद्ध करें',
  productDetails: 'उत्पाद विवरण',
  productName: 'उत्पाद का नाम',
  productNamePlaceholder: 'उदा. बाघ प्रिंट सूती साड़ी',
  category: 'श्रेणी',
  selectCategory: 'श्रेणी चुनें',
  craftType: 'शिल्प का प्रकार',
  selectCraft: 'शिल्प चुनें',
  description: 'विवरण',
  aiGenerate: 'AI जनरेट करें ✨',
  generating: 'जनरेट हो रहा है...',
  descriptionPlaceholder: "अपने उत्पाद का वर्णन करें... या स्वचालित विवरण बनाने के लिए 'AI जनरेट करें' पर क्लिक करें!",
  aiLoadingMsg: 'Kimi K2 आपके उत्पाद के लिए एक सुंदर विवरण तैयार कर रहा है...',
  aiSuggestedTags: 'AI सुझाए गए टैग',
  media: 'मीडिया',
  uploadMediaDesc: 'अपने उत्पाद के फ़ोटो और वीडियो अपलोड करें।',
  productImage: 'उत्पाद की छवि',
  productVideo: 'उत्पाद का वीडियो (वैकल्पिक)',
  filesUploadedAuto: 'प्रकाशित करते समय फ़ाइलें स्वचालित रूप से अपलोड हो जाएंगी।',
  pricing: 'मूल्य निर्धारण',
  pricingDesc: 'अपना मूल मूल्य निर्धारित करें। प्लेटफ़ॉर्म स्थिरता के लिए 15% जोड़ता है।',
  yourPrice: 'आपकी कीमत (₹)',
  yourPricePlaceholder: 'उदा. 3500',
  yourPriceLabel: 'आपकी कीमत',
  platformFee: 'प्लेटफ़ॉर्म शुल्क (15%)',
  buyerPays: 'खरीदार भुगतान करेगा',
  pricingOffer: '💚 पहले 6 महीनों के लिए निःशुल्क! आपको अपनी कीमत का 100% प्राप्त होता है।',
  publishing: 'प्रकाशित हो रहा है...',
  publishProduct: 'उत्पाद प्रकाशित करें',
  
  // Validation / Others
  textiles: '🧵 कपड़ा',
  paintings: '🎨 चित्रकारी',
  homeDecor: '🏠 घर की सजावट',
  sculptures: '🗿 मूर्तियां',
  accessories: '👜 एक्सेसरीज',
  jewelry: '💎 आभूषण',
  
  baghPrint: '🎨 बाघ प्रिंट',
  gondArt: '🖼️ गोंड कला',
  chanderiWeaving: '🧵 चंदेरी बुनाई',
  bellMetalCraft: '🔔 बेल धातु शिल्प',
  zardoziEmbroidery: '✨ ज़रदोज़ी कढ़ाई',
  other: 'अन्य',
  
  // Footer
  footerDesc: 'मध्य प्रदेश के कारीगरों को सीधे खरीदारों से जोड़कर सशक्त बनाना। परंपरा को संरक्षित करना, आजीविका को सक्षम करना।',
  quickLinks: 'त्वरित लिंक',
  shopAll: 'सभी खरीदारी करें',
  meetArtisans: 'कारीगरों से मिलें',
  becomeSeller: 'विक्रेता बनें',
  exploreCrafts: 'शिल्प का अन्वेषण करें',
  contact: 'संपर्क करें',
  madeWith: '© 2026 कला-केंद्र। मध्य प्रदेश के कारीगरों के लिए ❤️ के साथ बनाया गया',
  hackathon: 'हैकथॉन प्रोटोटाइप - ग्रामीण कारीगरों को सशक्त बनाना',

  // Navbar
  brandName: 'कला-केंद्र',
  navShop: 'दुकान',
  navArtisans: 'कारीगर',
  navDashboard: 'डैशबोर्ड',
  navLogout: 'लॉग आउट',
  navLogin: 'लॉगिन',
  navRegister: 'रजिस्टर'
};