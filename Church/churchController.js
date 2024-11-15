// импортируем модуль bcrypt для шифрования паролей
var bcrypt = require("bcrypt");

// импортируем JWT для декодирования web-token'ов
var jwt = require("jsonwebtoken");
var User = require("../User/userController");
var config = require("../config");
var token = require("../Token/tokenController");
var randtoken = require("rand-token");
var ObjectID = require('mongodb').ObjectID;
var Church = require('./churchModel');
var Century = require('../Century/centuryModel');



//create new church
exports.new = async function(req,res){
    var church =new Church();
    church._id = req.body.id?new ObjectID(req.body.id):new ObjectID();
    church.pastor = req.body.pastor?req.body.pastor:church.pastor;
    church.region = req.body.region?req.body.region:church.region;
    church.title = req.body.title?req.body.title:church.title;
    church.address = req.body.address?req.body.address:church.address;
    if (token.check(req, res) == true) {
     
      if(User.checkRights(3,'new',req)=='new'){
        church.save(function(err) {
            if (err) res.json({ status: "error", message: err });
            else { 
             
         //     res.status(201).json({ status: "church created", _id: church._id });
              User.addGroup(req,res,3,church.pastor,church._id,church);
            } 

          });
        }else{
            res.sendStatus(401);
        }
    }

}

//handle view Church info
exports.view = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(3,req.params.id,req)==true){
      Church.findById(req.params.id).populate('pastor').populate('region').exec(function(err, church) {
        if (err) res.send(err);
        res.json(church); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };


  exports.centuries = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(3,req.params.id,req)==true){
          Century.find({ church: req.params.id }).populate('century').exec(function(err, church) {
        if (err) res.send(err);
        res.json(church); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };

  //handle update church's info

  exports.update = function(req, res) {
    if (token.check(req, res) == true) {
        if(User.checkRights(3,req.params.id,req)==true){
        Church.findById(req.params.id, function(err, church) {
            if (err) res.send(err);

            if(req.body.pastor)church.pastor = req.body.pastor?req.body.pastor:church.pastor;
            church.region = req.body.region?req.body.region:church.region;
            church.title = req.body.title?req.body.title:church.title;
            church.address = req.body.address?req.body.address:church.address;
            church.pastor = req.body.pastor?req.body.pastor:church.pastor;
            church.save(function(err) {
                if (err) res.json(err);
                res.json({
                  message: "Church info updated",
                  data: church
                });
              });

        });
    }else{
        res.sendStatus(401);
    }
    }
    
}
//Handle delete church
exports.delete = function(req, res) {
    if (token.check(req, res) == true) {
      if(User.checkRights(3,req.params.id,req)==true){
        Church.remove(
        {
          _id: req.params.id
        },
        function(err, church) {
          if (err) res.send(err);
          res.json({
            status: "success",
            message: "church deleted"
          });
        }
      );
    }else{
        res.sendStatus(401);
    }
    }
  };
