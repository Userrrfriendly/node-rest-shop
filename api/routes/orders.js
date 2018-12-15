const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

//Remember the '/' below refers to the URI ==> '/orders/'
router.get('/', (req, res, next)=>{
  Order.find()
    .select('-__v')
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

// Before creating a new order we must ensure that the productId is valid (that the product exists): 
router.post("/", (req, res, next) => {
  Product.findById(req.body.productId)
    // .then(product=>console.log(product));
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
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
  res.status(200).json({
    message: 'Order details',
    orderId: req.params.orderId
  });
});

router.delete('/:orderId', (req, res, next)=>{
  res.status(200).json({
    message: 'Order deleted',
    orderId: req.params.orderId
  });
});

module.exports = router;
