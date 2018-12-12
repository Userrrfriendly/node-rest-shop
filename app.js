const express = require('express');
const app = express();

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

//every url requst starting with /products will be handled by productRoutes/orderRoutes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes)

module.exports = app;