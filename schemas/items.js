const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
    name: String, 
    status: String,
    ordering: Number
});

module.exports = mongoose.model('items', schema);