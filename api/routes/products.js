const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

//Remember the '/' below refers to the URI --> '/products/'
router.get('/', (req, res, next)=>{
  /**
    Since mongoose querries return a promise-like obj (mongoose promises can use .then() but can't use .catch() 
    (The exception is .save() method that returns a normal Promise)
    chain .exec() to make mongoose promise into a real promise (save())
      - Check the documentation cause this issue could be fixed by now
    in .select() you either pass the names of the props you want returned 
    OR the names of the props you don't want to return by prefixing them with a minus - 
    so both .select('-__v') && .select('name price _id') will yield the same results
   */

  Product.find()
    .select('-__v')
    .exec()
    .then(docs=> {
      const response = {
        count: docs.length,
        products: docs.map(doc=> {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc.id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id
            }
          }
        })
      }
      res.status(200).json(response);
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', (req, res, next)=>{
  //req.body is availiable because of body-parser middleware
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });
  //save the created product in the database with .save()
  product.save()
  .then(result => {
    console.log(result);
    res.status(201).json({
      message: 'Created product successfully',
      createdProduct: {
        name: result.name,
        price: result.price,
        _id: result._id,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products/' + result._id
        }
      }
    });
  })
  .catch(err=> {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.get('/:productId', (req, res, next)=>{
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then(doc=> {
      if (doc) {
        res.status(200).json({
          _id: doc._id,
          name: doc.name,
          price: doc.price,
          request: {
            type: 'GET',
            description: 'GET all products',
            url: 'http://localhost:3000/products/'
          }
        });
      } else {
        res.status(404).json({message: 'No valid entry found for the provied ID'});
      }
    })
    .catch(err=> {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.patch('/:productId', (req, res, next)=>{
  const id = req.params.productId;
  /* 
  For consistency with the original Tutorial I am leaving the code as is,
  the better solution seems to be the following:
      remove the existing updateOps and the for of loop and replace with the following code:
      const updateOps = req.body;
      Product.update({ _id: id }, updateOps).exec().then().catch();
      The difference is that with the above method the body of the request needs to be just a JSON object
      and should look like this: {"name":"Harry Potter", "price":"32.23"}
  *also the second argument of the Product.update { $set: updateOps} can be written without using {$set} (mongoose takes care of it behind the scene)
   Product.update({ _id: id }, updateOps) 
  */
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
  /*
    The following code expects the request body to be an array of objects hence the for ...of loop just above
    a PATCH/update body in the request should look something like this:
      [{"propName":"name", "value":"Harry potter 12" }, {"propName":"price", "value":".23"}]
  -Product.update takes 2 arguments the first arg matches the object we want to change and the second describes how we want to update it
  */
  Product.update({ _id: id }, { $set: updateOps })
  .exec()
  .then(result=> {
    res.status(200).json({
      message: 'Product Updated',
      request: {
        type: 'GET',
        url: 'http://localhost:3000/products/' + id
      }
    });
  })
  .catch(err=> {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

router.delete('/:productId', (req, res, next)=>{
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message:"Product Deleted"
      });
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;