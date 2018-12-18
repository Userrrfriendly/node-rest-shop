const mongoose = require('mongoose');

//Use mongoose.Schema to define how our product will look like (blueprint)
const productSchema = mongoose.Schema({
  // mongoose.Schema.Types.ObjectId is of specific format Mongoose uses internally
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String, required: true },
  price: {type: Number, required: true },
  productImage: {type: String, required: true } //type is String cause it's just a URL that will be stored in our mongoDB
});

/*export the schema wrapped into a model
  (the first argument is the name of the model we want to use internally, and the second is it's schema):
  -The schema is like the blueprint of that the product object we that we defined
  -The model gives you a constructor to build such objects based on that schema
*/
module.exports = mongoose.model('Product', productSchema);