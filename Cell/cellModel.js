var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var cellSchema = new mongoose.Schema({
  century:{ type: ObjectId, ref: 'Century' },
  leader:{ type: ObjectId, ref: 'User' },
  address :String,
  title:String
});

var Cell = module.exports = mongoose.model('Cell',cellSchema);

module.exports.get=function(callback,limit){
    Cell.find(callback).limit(limit);
}