var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var regionSchema = new mongoose.Schema({

  bishop:{ type: ObjectId, ref: 'User' },
  title:String
});

var Region = module.exports = mongoose.model('Region',regionSchema);

module.exports.get=function(callback,limit){
    Region.find(callback).limit(limit);
}