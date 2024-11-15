// импортируем модуль bcrypt для шифрования паролей
var bcrypt = require("bcrypt");

// импортируем JWT для декодирования web-token'ов
var jwt = require("jsonwebtoken");
var User = require("../User/userController");
var config = require("../config");
var token = require("../Token/tokenController");
var randtoken = require("rand-token");
var ObjectID = require('mongodb').ObjectID;
var Cell = require('./cellModel');




//create new cell
exports.new = async function(req,res){
    var cell =new Cell();
    cell._id = req.body.id?new ObjectID(req.body.id):new ObjectID();
    cell.leader = req.body.leader?req.body.leader:cell.leader;
    cell.century = req.body.century?req.body.century:cell.century;
    cell.title = req.body.title?req.body.title:cell.title;
    cell.address = req.body.address?req.body.address:cell.address;
    if (token.check(req, res) == true) {
     
      if(User.checkRights(1,'new',req)=='new'){

        cell.save(function(err) {
            if (err) res.json({ status: "error", message: err });
            else { 
              User.addGroup(req,res,1,cell.leader,cell._id,cell);
          //    res.status(201).json({ status: "cell created", _id: cell._id });
            } 

          });
        }else{
            res.sendStatus(401);
        }
    }

}


//handle view Cell info
exports.view = function(req, res) {
   
    if (token.check(req, res) == true) {
        if(User.checkRights(1,req.params.id,req)==true){
      Cell.findById(req.params.id).populate('leader').populate('century').exec(function(err, cell) {
        if (err) res.send(err);
        res.json(cell); 
      });
    }else{
        res.sendStatus(401);
    }
    } 
  };


  //handle update cell's info

  exports.update = function(req, res) {
    if (token.check(req, res) == true) {
        if(User.checkRights(1,req.params.id,req)==true){
        Cell.findById(req.params.id, function(err, cell) {
            if (err) res.send(err);

            if(req.body.leader)cell.leader = req.body.leader?req.body.leader:cell.leader;
            cell.century = req.body.century?req.body.century:cell.century;
            cell.title = req.body.title?req.body.title:cell.title;
            cell.address = req.body.address?req.body.address:cell.address;
            cell.leader = req.body.leader?req.body.leader:cell.leader;
            cell.save(function(err) {
                if (err) res.json(err);
                res.json({
                  message: "Cell info updated",
                  data: cell
                });
              });

        });
    }else{
        res.sendStatus(401);
    }
    }
    
}
//Handle delete cell
exports.delete = function(req, res) {
    if (token.check(req, res) == true) {
      if(User.checkRights(1,req.params.id,req)==true){
        Cell.remove(
        {
          _id: req.params.id
        },
        function(err, cell) {
          if (err) res.send(err);
          res.json({
            status: "success",
            message: "cell deleted"
          });
        }
      );
    }else{
        res.sendStatus(401);
    }
    }
  };
