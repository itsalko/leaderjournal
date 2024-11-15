// импортируем модуль bcrypt для шифрования паролей
var bcrypt = require("bcrypt");

// импортируем JWT для декодирования web-token'ов
var jwt = require("jsonwebtoken");
var User = require("../User/userController");
var config = require("../config");
var token = require("../Token/tokenController");
var randtoken = require("rand-token");
var ObjectID = require('mongodb').ObjectID;
var Region = require('./regionModel');
var Church =require('../Church/churchModel');



//create new region
exports.new = async function(req,res){
    var region =new Region();
    region._id = req.body.id?new ObjectID(req.body.id):new ObjectID();
    region.bishop = req.body.bishop?req.body.bishop:region.bishop;
   // region.super_region = req.body.super_region?req.body.super_region:region.super_region;
    region.title = req.body.title?req.body.title:region.title;
    
    if (token.check(req, res) == true) {
     
      if(User.checkRights(4,'new',req)=='new'){
        region.save(function(err) {
            if (err) res.json({ status: "error", message: err });
            else { 
              User.addGroup(req,res,4,region.bishop,region._id,region);
             // res.status(201).json({ status: "region created", _id: region._id });
            } 

          });
        }else{
            res.sendStatus(401);
        }
    }

}

//handle view Region info
exports.view = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(4,req.params.id,req)==true){
      Region.findById(req.params.id).populate('bishop').exec(function(err, region) {
        if (err) res.send(err);
        res.json(region); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };

   //handle list of regions  - for archbishop only
  exports.index = function(req, res) {
    if (token.check(req, res) == true) {
      if(User.checkRights(5,'all',req)==true){
        Region.find({}).populate('bishop',).exec(function(err, regions) {
        if (err) {
          res.json({ status: 'error', message: err });
        }
        res.json(regions);
      });

    }
    }
  };
  


  //handle view Region churches
exports.churches = function(req, res) {
   
  if (token.check(req, res) == true) {
      if(User.checkRights(4,req.params.id,req)==true){
        
        Church.find({ region: req.params.id }).populate('church').exec(function(err, region) {
      if (err) res.send(err);
      res.json(region); 
    });
  }else{
      res.sendStatus(401);
  }
  } 
};

  //handle update region's info

  exports.update = function(req, res) {
    if (token.check(req, res) == true) {
        if(User.checkRights(4,req.params.id,req)==true){
        Region.findById(req.params.id, function(err, region) {
            if (err) res.send(err);

            region.bishop = req.body.bishop?req.body.bishop:region.bishop;
          //  region.super_region = req.body.super_region?req.body.super_region:region.super_region;
            region.title = req.body.title?req.body.title:region.title;
            region.save(function(err) {
                if (err) res.json(err);
                res.json({
                  message: "Region info updated",
                  data: region
                });
              });

        });
    }else{
        res.sendStatus(401);
    }
    }
    
}
//Handle delete region
exports.delete = function(req, res) {
    if (token.check(req, res) == true) {
      if(User.checkRights(4,req.params.id,req)==true){
        Region.remove(
        {
          _id: req.params.id
        },
        function(err, region) {
          if (err) res.send(err);
          res.json({
            status: "success",
            message: "region deleted"
          });
        }
      );
    }else{
        res.sendStatus(401);
    }
    }
  };
