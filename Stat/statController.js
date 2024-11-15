User = require("../User/userModel");
Parish = require("../Parish/parishModel");
var token = require("../Token/tokenController");
var ObjectID = require('mongodb').ObjectID;

Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1;
  };

  function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    // Return array of year and week number
    return [d.getFullYear(), weekNo];
}

function weeksInYear(year) {
  var month = 11, day = 31, week;

  // Find week that 31 Dec is in. If is first week, reduce date until
  // get previous week.
  do {
    d = new Date(year, month, day--);
    week = getWeekNumber(d)[1];
  } while (week == 1);

  return week;
}


function ISO8601_week_no(dt) {
  var tdt = new Date(dt.valueOf());
  var dayn = (dt.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}


//get statistics from db
//:level is  0 - parish's individual stat, 1-cell stat, 2-century stat, 3- church stat, 4-region stat
exports.getStat = function(req,res){

    if (token.check(req, res) == true) {


      let d_from = new Date(req.query.from+"T00:00:00Z");
      let d_to = new Date(req.query.to+"T00:00:00Z");
      


        let w_from = ISO8601_week_no(d_from);
        let w_to = ISO8601_week_no(d_to);
        let y_from = d_from.getUTCFullYear();
        let y_to = d_to.getUTCFullYear();

      

        let now = new Date();
        var stat = {};

        if(!y_to)y_to= now.getUTCFullYear();
        if(!y_from)y_from= now.getUTCFullYear();

        let levels = ['_id','cell','century','church','region'];
        var weeksTotal;
       
        if(y_from==y_to){
            weeksTotal= Number(w_to) - Number(w_from) + 1;
        }else{

            let weeksYear = weeksInYear(y_from);

            weeksTotal = Number(weeksYear )- Number(w_from) + Number(w_to);
            
           
        }
                
       
    let level = levels[Number(req.params.level)].toString();
  
    let totalPerishes = 1;

    Parish.find({[level]:ObjectID(req.params.id)}).exec(function(err, parish) {
      if (err) res.send(err);

      totalPerishes = parish.length;

                    Parish.aggregate([
                        {'$unwind': '$activity'},
                         {$match:{
                            [level]:ObjectID(req.params.id),
                             'activity.week':{$gt:w_from-1,$lte:w_to},
                             'activity.year':{$gt:y_from-1,$lte:y_to},
                             'activity.sun':0
                            }
                        },
                         { $group: {
                             _id:null,'activity':{'$push':'$activity'},
                            sun: { $sum: 1 }}
                         }
                       ])

                
               .exec(function(err, parish) {
                      if (err) res.send(err);
                     console.log(parish);
                      if(parish[0]){
                       // console.log(parish[0].activity);
                          stat.sun = Math.round(Number((parish[0].sun)/totalPerishes*100)/weeksTotal);
                        }else{
                            stat.sun=0;}
                   
                    Parish.aggregate([
                        {'$unwind': '$activity'},
                         {$match:{
                          [level]:ObjectID(req.params.id),
                            'activity.week':{$gt:w_from-1,$lte:w_to},
                            'activity.year':{$gt:y_from-1,$lte:y_to},
                             'activity.cell':0}
                        },
                         { $group: {
                             _id:null,/*,'activity':{'$push':'$activity'}*/
                            cell: { $sum: 1 }} 
                         }
                       ])

                
               .exec(function(err, parish) {
                      if (err) res.send(err);
                      console.log(parish);
                      if(parish[0]){
                          stat.cell = Math.round(Number((parish[0].cell)/totalPerishes*100)/weeksTotal);
                        }else{stat.cell=0;}
                   
                        
                     res.json(stat);
                      
                    });
              
                      
                    });
              
             });
        


    }
}