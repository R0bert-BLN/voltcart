export type Address = {
  line1: string,
  city: string,
  postcode: string,
  country: string,
};

export type CartEntry = {
  id: string,
  qty: number,
};

export type User = {
  id: string,
  role: string,
  name: string,
  email: string,
  phone?: string,
  address?: Address,
  /** Product ids the account keeps on its wishlist. */
  wishlist?: string[],
  /** Product ids with a quantity, as left behind on a previous visit. */
  cart?: CartEntry[],
};

export type Category = {
  id: string,
  name: string,
  icon: string,
};

export type Supplier = {
  id: string,
  name: string,
  country: string,
};

export type DeliveryMethod = {
  id: string,
  name: string,
  price: number,
  time: string,
  days: number,
  icon: string,
};

export type OrderItem = {
  id: string,
  name: string,
  categoryId: string,
  price: number,
  qty: number,
};

export type Order = {
  id: string,
  date: string,
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
  estimated?: string,
  deliveryId: string,
  payment: 'card' | 'cod',
  last4?: string,
  items: OrderItem[],
  shipped?: string,
  delivered?: string,
  cancelled?: string,
};

export type ProductSpec = [label: string, value: string];

export type Product = {
  id: string,
  name: string,
  categoryId: string,
  supplierId: string,
  price: number,
  stock: number,
  deliveryIds: string[],
  updated: string,
  popular?: boolean,
  description: string,
  specs: ProductSpec[],
};

export const users: User[] = [
  {id: "u-client",role: "client",name: "Maya Keller",email: "maya.keller@example.com",phone: "+353 87 555 0142",address: {line1: "14 Harbour Road",city: "Galway",postcode: "H91 X2K7",country: "Ireland"},wishlist: ["au-halden-nc","mn-vanta-34","sh-ostra-cam"],cart: [{id: "lp-aster-14",qty: 1},{id: "ac-kite-mouse",qty: 2}]},
  {id: "u-admin",role: "admin",name: "Daniel Roth",email: "daniel.roth@voltcart.example"},
];

export const categories: Category[] = [
  {id: "laptops",name: "Laptops",icon: "laptop"},
  {id: "phones",name: "Phones",icon: "smartphone"},
  {id: "audio",name: "Audio",icon: "headphones"},
  {id: "monitors",name: "Monitors",icon: "monitor"},
  {id: "smart-home",name: "Smart home",icon: "lightbulb"},
  {id: "accessories",name: "Accessories",icon: "cable"},
];

export const suppliers: Supplier[] = [
  {id: "northlane",name: "Northlane Distribution",country: "Ireland"},
  {id: "kestrel",name: "Kestrel Tech Supply",country: "Germany"},
  {id: "meridia",name: "Meridia Electronics",country: "Netherlands"},
  {id: "balto",name: "Balto Components",country: "Poland"},
  {id: "solara",name: "Solara Trade",country: "Spain"},
];

export const deliveryMethods: DeliveryMethod[] = [
  {id: "standard",name: "Standard courier",price: 4.9,time: "2 to 4 days",days: 4,icon: "truck"},
  {id: "express",name: "Express courier",price: 9.9,time: "Next working day",days: 1,icon: "timer"},
  {id: "pickup",name: "Store pickup",price: 0,time: "Same day",days: 0,icon: "store"},
];

export const orders: Order[] = [
  {id: "VC-20431",date: "2026-11-01",status: "Processing",estimated: "2026-11-03",deliveryId: "express",payment: "card",last4: "4242",items: [{id: "ph-corvo-6",name: "Corvo 6 Smartphone",categoryId: "phones",price: 799,qty: 1},{id: "ac-pivot-charger",name: "Pivot 65 W GaN Charger",categoryId: "accessories",price: 49,qty: 1}]},
  {id: "VC-20412",date: "2026-10-28",status: "Shipped",shipped: "2026-10-30",estimated: "2026-11-03",deliveryId: "standard",payment: "card",last4: "4242",items: [{id: "mn-lumen-27",name: "Lumen 27 QHD Monitor",categoryId: "monitors",price: 329,qty: 1},{id: "ac-kite-keys",name: "Kite Low-Profile Keyboard",categoryId: "accessories",price: 89,qty: 1}]},
  {id: "VC-20377",date: "2026-09-14",status: "Delivered",shipped: "2026-09-15",delivered: "2026-09-17",deliveryId: "standard",payment: "card",last4: "4242",items: [{id: "lp-fernbook-13",name: "Fernbook 13 Laptop",categoryId: "laptops",price: 649,qty: 1},{id: "ac-pivot-dock",name: "Pivot 11-in-1 USB-C Dock",categoryId: "accessories",price: 119,qty: 1}]},
  {id: "VC-20291",date: "2026-06-03",status: "Delivered",shipped: "2026-06-03",delivered: "2026-06-03",deliveryId: "pickup",payment: "cod",items: [{id: "au-halden-buds",name: "Halden Buds Earbuds",categoryId: "audio",price: 129,qty: 2}]},
  {id: "VC-20204",date: "2026-03-19",status: "Cancelled",cancelled: "2026-03-20",deliveryId: "standard",payment: "card",last4: "1881",items: [{id: "au-orvel-soundbar",name: "Orvel 300 Soundbar",categoryId: "audio",price: 349,qty: 1},{id: "sh-ostra-cam",name: "Ostra Indoor Camera",categoryId: "smart-home",price: 69,qty: 1}]},
  {id: "VC-20118",date: "2025-12-08",status: "Delivered",shipped: "2025-12-09",delivered: "2025-12-11",deliveryId: "standard",payment: "cod",items: [{id: "sh-nimbus-hub",name: "Nimbus Home Hub",categoryId: "smart-home",price: 119,qty: 1},{id: "sh-nimbus-bulb",name: "Nimbus Colour Bulb 2-Pack",categoryId: "smart-home",price: 39,qty: 2}]},
];

export const products: Product[] = [
  {id: "lp-aster-14",name: "Aster Air 14 Laptop",categoryId: "laptops",supplierId: "kestrel",price: 1149,stock: 18,deliveryIds: ["standard","express","pickup"],updated: "2026-10-28",popular: true,description: "A light 14-inch laptop for travel and everyday work, with a quiet fan and battery that lasts a full working day.",specs: [["Display","14-inch, 2560 × 1600, 120 Hz"],["Processor","10-core, up to 4.8 GHz"],["Memory","16 GB"],["Storage","512 GB SSD"],["Battery","Up to 16 hours"],["Weight","1.28 kg"]]},
  {id: "lp-aster-16",name: "Aster Pro 16 Laptop",categoryId: "laptops",supplierId: "kestrel",price: 1899,stock: 7,deliveryIds: ["standard","express"],updated: "2026-10-12",popular: true,description: "A 16-inch workstation laptop for video editing and development, with a dedicated graphics card.",specs: [["Display","16-inch, 3200 × 2000, 165 Hz"],["Processor","14-core, up to 5.2 GHz"],["Graphics","8 GB dedicated"],["Memory","32 GB"],["Storage","1 TB SSD"],["Weight","2.15 kg"]]},
  {id: "lp-fernbook-13",name: "Fernbook 13 Laptop",categoryId: "laptops",supplierId: "meridia",price: 649,stock: 3,deliveryIds: ["standard","pickup"],updated: "2026-10-30",description: "A compact 13-inch laptop for students, with a matte screen and a full-size keyboard.",specs: [["Display","13.3-inch, 1920 × 1200"],["Processor","8-core, up to 4.1 GHz"],["Memory","8 GB"],["Storage","256 GB SSD"],["Weight","1.34 kg"]]},
  {id: "lp-ridge-15",name: "Ridge 15 Gaming Laptop",categoryId: "laptops",supplierId: "balto",price: 1399,stock: 11,deliveryIds: ["standard","express"],updated: "2026-09-22",description: "A 15-inch gaming laptop with a fast display and a per-key backlit keyboard.",specs: [["Display","15.6-inch, 2560 × 1440, 240 Hz"],["Graphics","12 GB dedicated"],["Memory","32 GB"],["Storage","1 TB SSD"],["Weight","2.4 kg"]]},
  {id: "ph-corvo-6",name: "Corvo 6 Smartphone",categoryId: "phones",supplierId: "northlane",price: 799,stock: 24,deliveryIds: ["standard","express","pickup"],updated: "2026-10-25",popular: true,description: "A 6.3-inch phone with a bright display, a triple camera and two days of battery.",specs: [["Display","6.3-inch OLED, 120 Hz"],["Storage","256 GB"],["Memory","12 GB"],["Camera","50 MP main, 12 MP ultra wide, 12 MP tele"],["Battery","5,000 mAh"],["Network","5G, Wi-Fi 7"]]},
  {id: "ph-corvo-mini",name: "Corvo Mini Smartphone",categoryId: "phones",supplierId: "northlane",price: 549,stock: 14,deliveryIds: ["standard","pickup"],updated: "2026-10-03",description: "A small phone that fits one hand, with the same main camera as the Corvo 6.",specs: [["Display","5.8-inch OLED, 90 Hz"],["Storage","128 GB"],["Memory","8 GB"],["Camera","50 MP main, 12 MP ultra wide"],["Battery","3,900 mAh"]]},
  {id: "ph-tessel-a4",name: "Tessel A4 Smartphone",categoryId: "phones",supplierId: "solara",price: 279,stock: 0,deliveryIds: ["standard"],updated: "2026-10-29",description: "An affordable phone with a large screen and a memory card slot.",specs: [["Display","6.6-inch LCD, 90 Hz"],["Storage","128 GB, expandable"],["Memory","6 GB"],["Camera","48 MP main"],["Battery","5,000 mAh"]]},
  {id: "ph-tessel-fold",name: "Tessel Fold Smartphone",categoryId: "phones",supplierId: "solara",price: 1249,stock: 5,deliveryIds: ["express","pickup"],updated: "2026-10-18",popular: true,description: "A foldable phone that opens into a small tablet, with a cover screen for quick replies.",specs: [["Inner display","7.6-inch OLED, 120 Hz"],["Cover display","6.2-inch OLED"],["Storage","512 GB"],["Memory","12 GB"],["Weight","239 g"]]},
  {id: "au-halden-nc",name: "Halden NC Headphones",categoryId: "audio",supplierId: "meridia",price: 279,stock: 32,deliveryIds: ["standard","express","pickup"],updated: "2026-10-21",popular: true,description: "Over-ear headphones with active noise cancelling and a soft headband for long flights.",specs: [["Type","Over-ear, closed back"],["Noise cancelling","Active, 3 levels"],["Battery","Up to 40 hours"],["Connection","Bluetooth 5.4, 3.5 mm"],["Weight","254 g"]]},
  {id: "au-halden-buds",name: "Halden Buds Earbuds",categoryId: "audio",supplierId: "meridia",price: 129,stock: 41,deliveryIds: ["standard","pickup"],updated: "2026-09-30",description: "Small wireless earbuds with a pocket-size charging case and a sweat-resistant finish.",specs: [["Type","In-ear, wireless"],["Battery","8 hours, 30 with case"],["Water resistance","IPX5"],["Connection","Bluetooth 5.3"]]},
  {id: "au-orvel-soundbar",name: "Orvel 300 Soundbar",categoryId: "audio",supplierId: "balto",price: 349,stock: 2,deliveryIds: ["standard"],updated: "2026-10-31",description: "A slim soundbar with a wireless subwoofer that clears up dialogue on any TV.",specs: [["Channels","3.1"],["Power","300 W"],["Inputs","HDMI ARC, optical, Bluetooth"],["Width","92 cm"]]},
  {id: "au-orvel-go",name: "Orvel Go Portable Speaker",categoryId: "audio",supplierId: "balto",price: 89,stock: 26,deliveryIds: ["standard","express","pickup"],updated: "2026-08-14",description: "A rugged pocket speaker that floats, with a strap for hanging from a backpack.",specs: [["Battery","Up to 14 hours"],["Water resistance","IP67"],["Connection","Bluetooth 5.3"],["Weight","340 g"]]},
  {id: "mn-lumen-27",name: "Lumen 27 QHD Monitor",categoryId: "monitors",supplierId: "kestrel",price: 329,stock: 16,deliveryIds: ["standard","express"],updated: "2026-10-15",popular: true,description: "A 27-inch office monitor with accurate colour and a stand that adjusts in height and angle.",specs: [["Size","27-inch"],["Resolution","2560 × 1440"],["Refresh rate","100 Hz"],["Panel","IPS"],["Ports","USB-C 65 W, HDMI, DisplayPort"]]},
  {id: "mn-lumen-32",name: "Lumen 32 4K Monitor",categoryId: "monitors",supplierId: "kestrel",price: 589,stock: 9,deliveryIds: ["standard","express"],updated: "2026-10-08",description: "A 32-inch 4K monitor for design and photo work, calibrated at the factory.",specs: [["Size","32-inch"],["Resolution","3840 × 2160"],["Refresh rate","60 Hz"],["Colour","99% DCI-P3"],["Ports","USB-C 90 W, HDMI, DisplayPort"]]},
  {id: "mn-vanta-34",name: "Vanta 34 Ultrawide Monitor",categoryId: "monitors",supplierId: "solara",price: 479,stock: 4,deliveryIds: ["standard"],updated: "2026-10-27",description: "A curved 34-inch ultrawide that replaces two monitors on a small desk.",specs: [["Size","34-inch, curved"],["Resolution","3440 × 1440"],["Refresh rate","144 Hz"],["Panel","VA"],["Ports","HDMI, DisplayPort"]]},
  {id: "mn-vanta-24",name: "Vanta 24 FHD Monitor",categoryId: "monitors",supplierId: "solara",price: 139,stock: 22,deliveryIds: ["standard","pickup"],updated: "2026-07-19",description: "A simple 24-inch monitor for a home office or a second screen.",specs: [["Size","24-inch"],["Resolution","1920 × 1080"],["Refresh rate","75 Hz"],["Panel","IPS"],["Ports","HDMI, VGA"]]},
  {id: "sh-nimbus-hub",name: "Nimbus Home Hub",categoryId: "smart-home",supplierId: "northlane",price: 119,stock: 19,deliveryIds: ["standard","pickup"],updated: "2026-10-10",popular: true,description: "A voice-controlled speaker that connects lights, plugs and sensors in one app.",specs: [["Voice control","Yes, with mute switch"],["Protocols","Wi-Fi, Zigbee, Thread"],["Speaker","20 W"],["Power","Mains adapter"]]},
  {id: "sh-nimbus-bulb",name: "Nimbus Colour Bulb 2-Pack",categoryId: "smart-home",supplierId: "northlane",price: 39,stock: 58,deliveryIds: ["standard","pickup"],updated: "2026-09-11",description: "Two dimmable colour bulbs that work with a schedule or from your phone.",specs: [["Fitting","E27"],["Brightness","1,100 lumen"],["Colours","16 million, warm to cool white"],["Protocol","Zigbee"]]},
  {id: "sh-ostra-cam",name: "Ostra Indoor Camera",categoryId: "smart-home",supplierId: "balto",price: 69,stock: 0,deliveryIds: ["standard"],updated: "2026-10-26",description: "A small indoor camera with a privacy shutter and motion alerts on your phone.",specs: [["Resolution","2K"],["Night vision","Up to 8 m"],["Storage","microSD, up to 256 GB"],["Privacy","Physical shutter"]]},
  {id: "sh-ostra-therm",name: "Ostra Smart Thermostat",categoryId: "smart-home",supplierId: "balto",price: 159,stock: 13,deliveryIds: ["standard","express"],updated: "2026-10-05",description: "A wall thermostat that learns your schedule and lowers the heating when you are out.",specs: [["Display","3.5-inch touch screen"],["Compatibility","Most gas and oil boilers"],["Connection","Wi-Fi"],["Power","Mains or 2 AA batteries"]]},
  {id: "ac-pivot-dock",name: "Pivot 11-in-1 USB-C Dock",categoryId: "accessories",supplierId: "meridia",price: 119,stock: 21,deliveryIds: ["standard","express","pickup"],updated: "2026-10-20",popular: true,description: "One cable to connect a laptop to two screens, a network and all your USB devices.",specs: [["Video","2 × HDMI, up to 4K at 60 Hz"],["Data","4 × USB-A, 2 × USB-C"],["Network","Gigabit Ethernet"],["Charging","Up to 100 W"]]},
  {id: "ac-pivot-charger",name: "Pivot 65 W GaN Charger",categoryId: "accessories",supplierId: "meridia",price: 49,stock: 47,deliveryIds: ["standard","pickup"],updated: "2026-09-25",description: "A small wall charger with enough power for a laptop and a phone together.",specs: [["Power","65 W"],["Ports","2 × USB-C, 1 × USB-A"],["Plug","Type G"],["Weight","110 g"]]},
  {id: "ac-kite-mouse",name: "Kite Wireless Mouse",categoryId: "accessories",supplierId: "solara",price: 45,stock: 33,deliveryIds: ["standard","pickup"],updated: "2026-08-30",description: "A quiet ergonomic mouse that pairs with three devices and switches between them.",specs: [["Sensor","4,000 DPI"],["Connection","Bluetooth, USB receiver"],["Battery","Up to 70 days, USB-C"],["Weight","95 g"]]},
  {id: "ac-kite-keys",name: "Kite Low-Profile Keyboard",categoryId: "accessories",supplierId: "solara",price: 89,stock: 12,deliveryIds: ["standard","express"],updated: "2026-10-01",description: "A thin mechanical keyboard with quiet switches and a warm white backlight.",specs: [["Layout","ISO, 75%"],["Switches","Low-profile, quiet"],["Connection","Bluetooth, USB-C"],["Battery","Up to 200 hours"]]},
];

