var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var centurySchema = new mongoose.Schema({
  church:{ type: ObjectId, ref: 'Church' },
  leader:{ type: ObjectId, ref: 'User' },
  title:String
});

var Century = module.exports = mongoose.model('Century',centurySchema);

module.exports.get=function(callback,limit){ 
    Century.find(callback).limit(limit); 
}