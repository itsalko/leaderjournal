// импортируем модуль bcrypt для шифрования паролей
var bcrypt = require("bcrypt");

// импортируем JWT для декодирования web-token'ов
var jwt = require("jsonwebtoken");
var User = require("../User/userController");
var config = require("../config");
var token = require("../Token/tokenController");
var randtoken = require("rand-token");
var ObjectID = require('mongodb').ObjectID;
var Century = require('./centuryModel');
var Cell = require('../Cell/cellModel');



//create new century
exports.new = async function(req,res){
    var century =new Century();
    century._id = req.body.id?new ObjectID(req.body.id):new ObjectID();
    century.leader = req.body.leader?req.body.leader:century.leader;
    century.church = req.body.church?req.body.church:century.church;
    century.title = req.body.title?req.body.title:century.title;
    if (token.check(req, res) == true) {
     
      if(User.checkRights(2,'new',req)=='new'){
        century.save(function(err) {
            if (err) res.json({ status: "error", message: err });
            else { 
             
             // res.status(201).json({ status: "century created", _id: century._id });
              User.addGroup(req,res,2,century.leader,century._id,century);
            } 

          });
        }else{
            res.sendStatus(401);
        }
    }

}

//handle view century info
exports.view = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(2,req.params.id,req)==true){
            Century.findById(req.params.id).populate('leader').populate('church').exec(function(err, century) {
        if (err) res.send(err);
        res.json(century); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };

//handle view century cells
exports.cells = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(2,req.params.id,req)==true){
          Cell.find({ century: req.params.id }).populate('cell').exec(function(err, century) {
        if (err) res.send(err);
        res.json(century); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };

  //handle update century's info

  exports.update = function(req, res) {
    if (token.check(req, res) == true) {
        if(User.checkRights(2,req.params.id,req)==true){
            Century.findById(req.params.id, function(err, century) {
            if (err) res.send(err);

            if(req.body.leader)century.leader = req.body.leader?req.body.leader:century.leader;
            century.church = req.body.church?req.body.church:century.church;
            century.title = req.body.title?req.body.title:century.title;
            century.leader = req.body.leader?req.body.leader:century.leader;
            century.save(function(err) {
                if (err) res.json(err);
                res.json({
                  message: "century info updated",
                  data: century
                });
              });

        });
    }else{
        res.sendStatus(401);
    }
    }
    
}
//Handle delete century
exports.delete = function(req, res) {
    if (token.check(req, res) == true) {
      if(User.checkRights(2,req.params.id,req)==true){
        Century.remove(
        {
          _id: req.params.id
        },
        function(err, century) {
          if (err) res.send(err);
          res.json({
            status: "success",
            message: "century deleted"
          });
        }
      );
    }else{
        res.sendStatus(401);
    }
    }
  };
