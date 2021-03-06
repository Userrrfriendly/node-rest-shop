const express = require('express');
const app = express();
const morgan = require('morgan'); //HTTP request logger middleware for node.js (eg it logs the GET/POST/etc request in the console as the app runs)
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
/*process.env.MONGO_ATLAS_PW (along with any other environment variables) is set in the nodemon.json
  in the initial tutorial mongoose.connect was passed a second argument that was removed because its outdated?--> {useMongoClient: true}
  instead { useNewUrlParser: true } needs to be passed, otherwise node throws error
*/
mongoose.connect('mongodb+srv://admin:' + process.env.MONGO_ATLAS_PW + '@cluster0-xbv2u.mongodb.net/test?retryWrites=true', { useNewUrlParser: true })
/*In the older versions of mongoose we should include the following line of code after mongoose.connect();
    mongoose.Promise = global.Promise
this ensured that a mongoose promise turned into a real promise... it seems that the current version of mongoose
doesn't need this so it was ommited
 */
//no clue what mongoose.set('useCreateIndex', true);  does but it removes the WARNING in the console (for more look at User Model)
//that is thrown once the User schema gets a unique: true checked in the email property
mongoose.set('useCreateIndex', true);
//since morgan 'wraps' all our requests it will be declared(and exectued) first
app.use(morgan('dev'));
//makes a folder publicly availiable (static).The first arguments tells express to parse only requests that target '/uploads'
// that way the product image can be displayed in the browser at http://localhost:3000/<productImage> 
app.use('/uploads', express.static('uploads'));
//we should set extended to either true or false, true allows you to parse Extended bodies with rich data in it 
//I will set it to false to only support simple bodies for URL encoded data 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// The next app.use() handles CORS manually by appending the headers to every response we sent back
// it's probably a good idea to use a package like https://github.com/expressjs/cors to take care of it.
app.use((req, res, next)=>{
  // res.header('Access-Control-Allow-Origin', 'http://my-cool-page.com'); <-- This insures that only my-cool-page.com can is excluded to CORS
  res.header('Access-Control-Allow-Origin', '*'); //the '*' allows all pages to use our API
  //difine which headers we allow to accept
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
app.use('/user', userRoutes);

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