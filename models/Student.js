const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  date:     { type: Date,   required: true },
  class:    { type: String, required: true },
  address:  { type: String, required: true },
  payment:  { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
