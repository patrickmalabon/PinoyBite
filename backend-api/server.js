const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '6mb' }));
app.use(cors());


let nextId = 13;

let products = [
  {
    id: 1,
    brand: "McDo",
    name: "Big Burger Meal",
    price: 159,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 2,
    brand: "McDo",
    name: "Chicken & Fries",
    price: 149,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 3,
    brand: "McDo",
    name: "McDo Fries",
    price: 69,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 4,
    brand: "McDo",
    name: "McFloat",
    price: 59,
    image: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 5,
    brand: "Jollibee",
    name: "Chickenjoy Meal",
    price: 149,
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 6,
    brand: "Jollibee",
    name: "Yumburger",
    price: 69,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 7,
    brand: "Jollibee",
    name: "Jolly Spaghetti",
    price: 79,
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 8,
    brand: "Jollibee",
    name: "Peach Mango Pie",
    price: 45,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 9,
    brand: "Inasal",
    name: "Chicken Inasal Meal",
    price: 159,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 10,
    brand: "Inasal",
    name: "Pecho Meal",
    price: 179,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 11,
    brand: "Inasal",
    name: "Liempo Meal",
    price: 169,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  },
  {
    id: 12,
    brand: "Inasal",
    name: "Halo-Halo",
    price: 89,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=82",
    status: "Available"
  }
];


function availableProducts() {
  return products.filter((p) => p.status === 'Available');
}

function logSingle(title, product) {
  console.log(`\n[PRODUCT] ${title}`);
  console.table([product]);
}

function logAvailable() {
  console.log('\nAVAILABLE PRODUCTS AFTER DELETE');
  console.table(availableProducts());
}

app.get('/api/product', (req, res) => {
  res.json(products);
});

app.post('/api/product', (req, res) => {
  const name = String(req.body.name || '').trim();
  const price = Number(req.body.price);

  if (!name || Number.isNaN(price)) {
    return res.status(400).json({ message: 'Name and valid price are required.' });
  }

  const product = {
    id: nextId++,
    name,
    price,
    image: String(req.body.image || ''),
    status: 'Available'
  };

  products.push(product);
  logSingle('CREATED', product);
  res.status(201).json(product);
});

app.put('/api/product/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const name = String(req.body.name ?? product.name).trim();
  const price = Number(req.body.price ?? product.price);

  if (!name || Number.isNaN(price)) {
    return res.status(400).json({ message: 'Name and valid price are required.' });
  }

  product.name = name;
  product.price = price;
  if (Object.prototype.hasOwnProperty.call(req.body, 'image')) product.image = String(req.body.image || '');
  product.status = 'Available';

  logSingle('UPDATED', product);
  res.json(product);
});

app.delete('/api/product/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const [deleted] = products.splice(index, 1);

  logSingle('DELETED', deleted);
  logAvailable();

  res.json({ deleted, available: availableProducts() });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});