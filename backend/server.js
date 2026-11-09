'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 8080;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_URL)
  .split(',').map(x => x.trim()).filter(Boolean);

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    // On Google-hosted environments, use the attached service identity.
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}
const db = admin.firestore();

app.use(cors({ origin(origin, callback) {
  if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'), false);
}}));
app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); } }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'BizManager Paystack backend' }));

function cleanCustomer(input) {
  const customer = input && typeof input === 'object' ? input : {};
  const result = {
    name: String(customer.name || '').trim().slice(0, 120),
    phone: String(customer.phone || '').trim().slice(0, 40),
    email: String(customer.email || '').trim().toLowerCase().slice(0, 254),
    city: String(customer.city || '').trim().slice(0, 120),
    address: String(customer.address || '').trim().slice(0, 500),
    note: String(customer.note || '').trim().slice(0, 500)
  };
  if (!result.name || !result.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
    const err = new Error('Please provide a customer name and valid email address.'); err.status = 400; throw err;
  }
  return result;
}

async function getVerifiedCart(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    const err = new Error('Your cart is empty or contains too many different products.'); err.status = 400; throw err;
  }
  const verified = [];
  let total = 0;
  for (const item of items) {
    const productId = String(item.productId || '').trim();
    const quantity = Number(item.quantity);
    if (!productId || productId.length > 150 || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      const err = new Error('The cart contains an invalid product or quantity.'); err.status = 400; throw err;
    }
    const snap = await db.collection('products').doc(productId).get();
    if (!snap.exists) { const err = new Error(`Product ${productId} was not found.`); err.status = 400; throw err; }
    const data = snap.data();
    const price = Number(data.price ?? data.sellingPrice);
    const stock = Number(data.stock ?? data.quantity ?? 0);
    if (!Number.isFinite(price) || price < 0) { const err = new Error(`Product ${data.name || productId} has an invalid price.`); err.status = 400; throw err; }
    if (quantity > stock) { const err = new Error(`Not enough stock for ${data.name || productId}. Available: ${stock}.`); err.status = 409; throw err; }
    const subtotal = Math.round((price * quantity + Number.EPSILON) * 100) / 100;
    total = Math.round((total + subtotal + Number.EPSILON) * 100) / 100;
    verified.push({ productId, name: String(data.name || data.productName || 'Product').slice(0, 200), price, quantity, subtotal });
  }
  if (total <= 0) { const err = new Error('Order total must be greater than zero.'); err.status = 400; throw err; }
  return { items: verified, total };
}

async function initializePaystack({ customer, items }) {
  if (!PAYSTACK_SECRET_KEY) { const err = new Error('The Paystack secret key is not configured on the backend.'); err.status = 503; throw err; }
  if (!FRONTEND_URL || !/^https:\/\//i.test(FRONTEND_URL)) { const err = new Error('Set FRONTEND_URL to your deployed HTTPS website URL.'); err.status = 503; throw err; }
  const safeCustomer = cleanCustomer(customer);
  const cart = await getVerifiedCart(items);
  const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const reference = `BM-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const order = {
    id: orderNumber, orderNumber, reference,
    customer: safeCustomer,
    items: cart.items,
    total: cart.total,
    paymentMethod: 'Paystack',
    paymentDetails: { method: 'Paystack' },
    paymentStatus: 'pending',
    status: 'Pending',
    currency: 'GHS',
    createdAt: new Date().toISOString(),
    date: new Date().toISOString(),
    stockDeducted: false
  };
  await db.collection('orders').doc(orderNumber).set(order);
  let response;
  try {
    response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: safeCustomer.email,
        amount: String(Math.round(cart.total * 100)),
        currency: 'GHS',
        reference,
        callback_url: `${process.env.BACKEND_PUBLIC_URL || ''}/api/paystack/callback`,
        channels: ['card', 'mobile_money', 'bank'] ,
        metadata: { orderNumber, customerName: safeCustomer.name, custom_fields: [
          { display_name: 'Order Number', variable_name: 'order_number', value: orderNumber }
        ] }
      })
    });
    const data = await response.json();
    if (!response.ok || !data.status || !data.data?.authorization_url) throw new Error(data.message || 'Paystack could not initialize this transaction.');
    return { authorization_url: data.data.authorization_url, reference, orderNumber };
  } catch (error) {
    await db.collection('orders').doc(orderNumber).update({ paymentStatus: 'initialization_failed', paymentError: String(error.message).slice(0, 300) });
    throw error;
  }
}

async function verifyPaystack(reference) {
  if (!PAYSTACK_SECRET_KEY) throw new Error('Paystack secret key is not configured.');
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
  });
  const result = await response.json();
  if (!response.ok || !result.status || !result.data) throw new Error(result.message || 'Could not verify Paystack transaction.');
  return result.data;
}

async function markOrderPaid(reference, transactionData) {
  if (transactionData.status !== 'success' || transactionData.currency !== 'GHS') return { paid: false, reason: 'Payment is not successful or currency does not match.' };
  const orderQuery = await db.collection('orders').where('reference', '==', reference).limit(1).get();
  if (orderQuery.empty) throw new Error('No order matches this Paystack reference.');
  const orderDoc = orderQuery.docs[0];
  const order = orderDoc.data();
  if (Math.round(Number(transactionData.amount)) !== Math.round(Number(order.total) * 100)) throw new Error('The verified payment amount does not match the order total.');
  if (order.paymentStatus === 'paid' && order.stockDeducted === true) return { paid: true, orderNumber: order.orderNumber, alreadyProcessed: true };

  await db.runTransaction(async tx => {
    const freshOrderSnap = await tx.get(orderDoc.ref);
    const freshOrder = freshOrderSnap.data();
    if (freshOrder.paymentStatus === 'paid' && freshOrder.stockDeducted === true) return;
    const productReads = [];
    for (const item of freshOrder.items || []) {
      const ref = db.collection('products').doc(String(item.productId));
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error(`Product ${item.name} no longer exists; contact the shop owner.`);
      const data = snap.data();
      const stock = Number(data.stock ?? data.quantity ?? 0);
      if (Number(item.quantity) > stock) throw new Error(`Not enough stock remains for ${item.name}; payment received but order requires manual review.`);
      productReads.push({ ref, stock: stock - Number(item.quantity) });
    }
    for (const product of productReads) tx.update(product.ref, { stock: product.stock, quantity: product.stock });
    tx.update(orderDoc.ref, {
      paymentStatus: 'paid', status: 'Processing', stockDeducted: true,
      paidAt: new Date().toISOString(),
      paystack: { reference, transactionId: String(transactionData.id || ''), channel: transactionData.channel || '', gatewayResponse: transactionData.gateway_response || '' }
    });
  });
  return { paid: true, orderNumber: order.orderNumber };
}

app.post('/api/paystack/initialize', async (req, res) => {
  try { res.json(await initializePaystack(req.body || {})); }
  catch (error) { res.status(error.status || 500).json({ error: error.message || 'Unable to initialize payment.' }); }
});

app.get('/api/paystack/callback', async (req, res) => {
  const reference = String(req.query.reference || '').trim();
  if (!reference) return res.redirect(`${FRONTEND_URL}/checkout.html?payment=failed`);
  try {
    const verified = await verifyPaystack(reference);
    const result = await markOrderPaid(reference, verified);
    if (result.paid) return res.redirect(`${FRONTEND_URL}/checkout.html?payment=success&order=${encodeURIComponent(result.orderNumber)}&reference=${encodeURIComponent(reference)}`);
    return res.redirect(`${FRONTEND_URL}/checkout.html?payment=pending`);
  } catch (error) {
    console.error('Paystack callback verification error:', error.message);
    return res.redirect(`${FRONTEND_URL}/checkout.html?payment=verification_failed`);
  }
});

// Paystack webhook: validate the signature before trusting the event.
app.post('/api/paystack/webhook', async (req, res) => {
  try {
    const signature = req.get('x-paystack-signature');
    const body = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY || '').update(body).digest('hex');
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).send('Invalid signature');
    const event = JSON.parse(body.toString('utf8'));
    if (event.event === 'charge.success' && event.data?.reference) {
      const verified = await verifyPaystack(event.data.reference);
      await markOrderPaid(event.data.reference, verified);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error('Paystack webhook error:', error.message);
    return res.sendStatus(500);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(500).json({ error: 'Server error.' });
});

app.listen(PORT, () => console.log(`BizManager Paystack backend listening on ${PORT}`));
