const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

//Remember the '/' below refers to the URI ==> '/orders/'
router.get('/', (req, res, next)=>{
  /*By using the .populate() method before the .exec() we can populate a property with data referenced from elsewhere
    *First argument in populate is the name of the property we want to populate. The 'product' that we pass can be found at its schema aka at order.js
    *By passing the second optional argument we can select which properties we want to display - just like the .select() method
    *more on .populate() --> https://mongoosejs.com/docs/populate.html
  */
  Order.find()
    .select('-__v')
    .populate('product', '-__v')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(order=> {
          return {
            _id: order._id,
            quantity: order.quantity,
            product: order.product,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + order._id
            }
          }
        })
      })
    })
    .catch(err=> {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", (req, res, next) => {
  // Checks if the ObjectId is valid before proceeding with the request (otherwise unexpected things happen)
  if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
    return res.status(404).json({
      message: 'Invalid ID'
    });
  }
  /*
    If the ObjectId is valid checks if it exists in the database before creating the order
    If the ObjectId is valid but doesnt exist in our DB the response returns 404 (as intended)
    but the console floods with errors... Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client ....
    possible cause: but the issue was his error handling in my case. 
      When we checked whether or not something exists we return res.status when we should actually throw it to the catch block.
      We're sending a response instead of allowing the catch block to send a response. 
      Example: if (!doc) { res.status(404).json({ message: "Product not found" }) } 
      Should be: if (!doc) { throw "Product not found"; } 
  */  
  Product.findById(req.body.productId)
    .exec()
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          product
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:orderId', (req, res, next)=>{
  Order.findById(req.params.orderId)
    .populate('product', '-__v')
    .exec()
    .then(order=> {
      if (!order) {
        res.status(404).json({
          message:'order not found'
        })
      }
      res.status(200).json({
        _id: order._id,
        product: order.product,
        quantity: order.quantity,
        request: {
          type:'GET',
          url: 'http://localhost:3000/orders'
        }
      })
    })
    .catch(err=>{
      res.status(500).json({
        message: 'Order not found',
        error: err
      })
    });
});

router.delete('/:orderId', (req, res, next)=>{
  //Need to check if the order exist, now if you send a DELETE request pointing at a valid ID that doesn't exist it will return 'Order Deleted'
  const id = req.params.orderId;
  Order.deleteOne({_id:id})
    .exec()
    .then((result)=>{
      res.status(200).json({
        message:'Order Deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: {productId: 'ID', quantity: 'Number'}
        }
      })
    })
    .catch(err=>{
      res.status(500).json({
        message: 'Order Id didn\'t match any products in database'
      })
    })

});

module.exports = router;
