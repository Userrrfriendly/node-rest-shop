const express = require('express');
const app = express();
const morgan = require('morgan'); //HTTP request logger middleware for node.js (eg it logs the GET/POST/etc request in the console as the app runs)
const bodyParser = require('body-parser');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

//since morgan 'wraps' all our requests it will be declared(and exectued) first
app.use(morgan('dev'));
//we should set extended to either true or false, true allows you to parse Extended bodies with rich data in it 
//I will set it to false to only support simple bodies for URL encoded data 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

/*
  The next app.use() handles CORS manually by:
    -appending the headers to every response we sent back
  it's probably a good idea to use a package like https://github.com/expressjs/cors to take care of it.

*/ 
app.use((req, res, next)=>{
  // res.header('Access-Control-Allow-Origin', 'http://my-cool-page.com'); <-- This insures that only my-cool-page.com can is allowed excluded to CORS
  res.header('Access-Control-Allow-Origin', '*');
  //next we difine which headers we allow to accept
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  //since the browser will always send an OPTIONS first before POST or PUT
  //in this case we will add an additional header where we tell the browser what it may send
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
})

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
});

module.exports = app;