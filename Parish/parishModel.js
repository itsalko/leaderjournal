var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


//var activitySchema = new mongoose.Schema({week:Number,year:Number,cell:Number,sun:Number});


var parishSchema = new mongoose.Schema({
  name:String,
  surname:String, 
  birthday :String,
  userpic:String,  
  phone:String, 
  address:String,
  cell:[{type: ObjectId, ref: 'Cell' }],   
  role:[Number],
  church:[{ type: ObjectId, ref: 'Church' }],
  century:[{ type: ObjectId, ref: 'Century' }],
  region:[{ type: ObjectId, ref: 'Region' }],
  activity:[
    {
      week:Number,
      year:Number,
      cell:Number,
      sun:Number
    }
    
  ]
});

var Parish = module.exports = mongoose.model('parish',parishSchema);

module.exports.get=function(callback,limit){
    Parish.find(callback).limit(limit);
}