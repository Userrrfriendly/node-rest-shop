const mongoose = require('mongoose');

/* 
  unique keyword in the email below doesn't add any validation (we have to do it manually)
  instead it adds  performance optiomization in current version of mongoose it also throws a warning:
  DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
  mongoose.set('useCreateIndex', true); was added in app.js to remove the warning
*/
const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match:  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);