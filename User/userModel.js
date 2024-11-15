var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


var activitySchema = new mongoose.Schema({week:String});


var userSchema = new mongoose.Schema({
  name:String,
  surname:String, 
  birthday :String,
  //sex:String,
  userpic:String,  
  phone:String, 
  //address:String,
  email:{type: String, required: true, unique:true,index:true},
  cell:[{type: ObjectId, ref: 'Cell' }],   
  role:[Number],
  activity:[activitySchema], 
  church:[{ type: ObjectId, ref: 'Church' }],
  century:[{ type: ObjectId, ref: 'Century' }],
  region:[{ type: ObjectId, ref: 'Region' }],
  password: { type: String, required: true, select: false},
  refreshToken:{ type: String, unique: false, select: false},
});

var User = module.exports = mongoose.model('User',userSchema);

module.exports.get=function(callback,limit){
    User.find(callback).limit(limit);
}