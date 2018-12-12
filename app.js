const express = require('express');
const app = express();
const morgan = require('morgan'); //HTTP request logger middleware for node.js

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

//since morgan 'wraps' all our requests it will be declared(and exectued) first
app.use(morgan('dev'));

//every url requst starting with /products will be handled by productRoutes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

//handling Errors
app.use((req, res, next)=>{
  //creates a new custom error and passes the error to the next() middleware
  const error = new Error('Not Found [custom error]');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next)=>{
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
})
module.exports = app;