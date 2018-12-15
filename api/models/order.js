const mongoose = require('mongoose');

/*Notice how a relation is created in the orderSchema:
  product: type is ofcourse mongoose.Schema.Types.ObjectId since it is generated and managed by mongoose
  the connection is established by using the -->ref<-- keyword that needs to point to the object that it is releated 
  ( in our case it is the Product Model  ) 
*/
const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default:1 }
});


module.exports = mongoose.model('Order', orderSchema);