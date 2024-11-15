var bcrypt = require('bcrypt');

// импортируем JWT для декодирования web-token'ов 
var jwt = require('jsonwebtoken');
var randtoken = require('rand-token'); 

var config = require('../config');
var accessTokenExpiresIn = '30d'; //30 days token expires period
var refreshTokenExpiresIn = '60d';

getAccessToken = function(tokenID,userId,email){
   return jwt.sign({type:'access',tokenID:tokenID,id:userId,email:email},config.jwt.secret,{expiresIn:accessTokenExpiresIn});
}

getRefreshToken = function (tokenID,userId,email) {
    return jwt.sign({type:'refresh',id:userId,tokenID:tokenID,email:email},config.jwt.secret,{expiresIn:refreshTokenExpiresIn});
    
}

exports.getAccess = function (req,res,next) {

    if(req.body.grant_type=='password'){ 

    if(!req.body.username||!req.body.password){return res.sendStatus(400)}
    else{
        var email = req.body.username; 
        var password = req.body.password;
        User.findOne({email:email}).select('password').exec(function(err,user){
            if(err){return res.sendStatus(500)}
            if(!user){return res.sendStatus(401)}
            
            bcrypt.compare(password,user.password,function(err, valid){
                if(err){return res.sendStatus(500)}
                if(!valid){return res.sendStatus(401)}

              
                if(err)res.send(err);
                let tokens = generateTokens(user.id,email);
                
                res.send(tokens);

               updateRefreshToken(tokens.refresh_token,user.id);
               
            });
        })

    }
}else if(req.body.grant_type=='refresh_token'){

    if(!req.body.refresh_token){return res.sendStatus(401)}

   // oldAccessToken = req.headers['x-auth'];
    oldRefreshToken = req.body.refresh_token;
  
    /*
    if((jwt.decode(oldAccessToken).tokenID!=jwt.decode(oldRefreshToken).tokenID)||
        (jwt.decode(oldAccessToken).id!=jwt.decode(oldRefreshToken).id)){return res.sendStatus(401)}
        */

        let userId = jwt.decode(oldRefreshToken).id;
    
        User.findOne({_id:userId}).select('refreshToken').exec(function(err,user){
          
            if(err){return res.sendStatus(500)}
            if(!user){return res.sendStatus(401)}


            if(user.refreshToken==''){
                updateRefreshToken('',userId);
             
                return res.sendStatus(401);
                
            }
            
            if(!user.refreshToken||user.refreshToken!=oldRefreshToken){
                updateRefreshToken('',userId);
              
               return res.sendStatus(401);
            }

          
    
            jwt.verify(oldRefreshToken, config.jwt.secret, function(err, decoded) {
                
                if (err) {
                    updateRefreshToken('',userId);
                   
                    return res.status(401).send('Refresh token is invalid or expired');
                 
                }
        
              });
    
                 
              let tokens = generateTokens(userId,email);
    
              updateRefreshToken(tokens.refreshToken,userId);
                  
                    res.send(tokens);
      
            
        });


    
       
}else{
    res.sendStatus(400);
}


}

updateRefreshToken = function (refreshToken,userId) {

    User.findOne({_id:userId}).select('refreshToken').exec(function(err,user){
        if(err)res.send(err);
        
        user.refreshToken = refreshToken;
       
        user.save(function(err){
            if(err)res.json(err); 
            
        });

       
    });
    
}

generateTokens = function (userId,email) {

    let tokenID = randtoken.uid(128);

    let accessToken =getAccessToken(tokenID,userId,email);
    let refreshToken = getRefreshToken(tokenID,userId,email);
          
 //   console.log(jwt.decode(accessToken))
    let usr = {}; 
        usr.id = userId;
        usr.access_token = accessToken;
        usr.expires_in = jwt.decode(accessToken).exp;
        usr.refresh_token = refreshToken;
       // usr.refreshTokenExp = jwt.decode(refreshToken).exp;
        
      return usr;
}


exports.check = function(req,res){
    
    if(!req.headers['x-auth']) {
        return res.sendStatus(401)
    }

   return jwt.verify(req.headers['x-auth'], config.jwt.secret, function(err, decoded) {
       // console.log(decoded)
        if (err) {
            return res.status(401).send(err.message);
          /*
            err = {
              name: 'TokenExpiredError',
              message: 'jwt expired',
              expiredAt: 1408621000 
            }
          */
        }else{   
           
                return true;

            
       
    }
      });
}

 