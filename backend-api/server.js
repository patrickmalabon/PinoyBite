const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '6mb' }));
app.use(cors());

let nextId = 1;
let products = [];

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

app.listen(8080, () => {
  console.log('Server running on port 8080');
  console.log('http://localhost:8080/api/product');
});
