var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var churchSchema = new mongoose.Schema({
  region:{ type: ObjectId, ref: 'Region' },
  pastor:{ type: ObjectId, ref: 'User' },
  address :String,
  title:String
});

var Church = module.exports = mongoose.model('Church',churchSchema);

module.exports.get=function(callback,limit){
    Church.find(callback).limit(limit);
}