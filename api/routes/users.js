const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
/*bcrypt will  hash our passwords in a secure way
  bcrypt.hash(req.body.password, 10, (err,hash)=>{}) first param is the actual password and the second is the salt 
  salt is a random string that gets added the plain text password before its HASHed so the strings that are added
  are also stored in the HASH, the SECOND argument is the number of salting rounds? 10 is considered safe
  THIRD argument is a callback 
*/
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req,res,next)=>{
  //if .find() doesn't match it will return AN EMPTY ARRAY! 
  User.find({email:req.body.email})
  .exec()
  .then(user=>{
    if (user.length >=1) {
      //409 = conflict, 422 = uporcessable entity
      return res.status(409).json({
        message: 'There is already a registerd user with this email'
      });
    } else {
      bcrypt.hash(req.body.password, 10, (error,hash)=>{
        if (error) {
          return res.status(500).json({
            error
          });
        } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash 
              });
            user.save()
              .then(result=>{
                console.log(result);
                res.status(201).json({
                  message: 'User Created'
                })
              })
              .catch(err=>{
                console.log(err);
                res.status(500).json({
                  error:err
                });
              });
          }
      });
    }
  });
});

router.delete('/:userId', (req,res,next)=>{
  console.log('xa' + req.params.userId)
  User.deleteOne({ _id: req.params.userId })
  .exec()
  .then(result=> {
    console.log(result)
    res.status(200).json({
      message:'User deleted'
    });
  })
  .catch(err=>{
    console.log(err);
      return res.status(500).json({
      error:err
    });
  }
  );
});

router.get('/users', (req,res,next)=>{
  User.find()
  .select('-__v')
  .exec()
  .then(result=> {
    console.log(result)
    res.status(200).json({
      allUsers: result.map(user=>{
        return {user}
      })
    });
  })
  .catch(err=>{
    console.log(err);
      return res.status(500).json({
      error:err
    });
  }
  );
});

module.exports = router;