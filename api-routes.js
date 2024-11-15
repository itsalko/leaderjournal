let router=require('express').Router();

router.get('/',function(req,res){
    res.json({
        status:'API working',
        message:'Welcome'
    });
});

var userController = require('./User/userController');
var tokenController = require('./Token/tokenController');
var statController = require('./Stat/statController');
var cellController = require('./Cell/cellController');
var centuryController = require('./Century/centuryController');
var churchController = require('./Church/churchController');
var regionController = require('./Region/regionController');

router.route('/login').post(tokenController.getAccess);

router.route('/loginInfo')
    .get(userController.loginInfo);

router.route('/users')
    .get(userController.index)
    .post(userController.new);

router.route('/users/:id')
    .get(userController.view)
    .patch(userController.patch)
    .put(userController.update)
    .delete(userController.delete);

    //down by the beard of Aarohn
router.route('/users/:id/beard/:role/:group_id')
    .get(userController.beard);

    //add parish to user's cell group
router.route('/users/:id/parish') 
.post(userController.new_parish);

 //view/edit parish in user's cell group
router.route('/users/:id/parish/:group_id/:parish_id') 
.get(userController.view_parish)  
.put(userController.update_parish)
.patch(userController.parish_activity_add)
.delete(userController.delete_parish);

//get statistics from db
//:level is  0 - parish's individual stat, 1-cell stat, 2-century stat, 3- church stat, 4-region stat
router.route('/stat/:level/:id')
.get(statController.getStat);

//upload photo for user/parish
router.route('/photo/:id').post(userController.upload_photo);

//Cell groups routing
router.route('/cell')
.post(cellController.new);

router.route('/cell/:id')
    .get(cellController.view)
    .put(cellController.update)
    .delete(cellController.delete);

router.route('/century')
.post(centuryController.new);

router.route('/century/:id')
    .get(centuryController.view)
    .put(centuryController.update)
    .delete(centuryController.delete);

router.route('/century/:id/cells')
    .get(centuryController.cells);


router.route('/church')
.post(churchController.new);

router.route('/church/:id')
    .get(churchController.view)
    .put(churchController.update)
    .delete(churchController.delete);

router.route('/church/:id/centuries')
    .get(churchController.centuries);

router.route('/region')
    .post(regionController.new);

router.route('/region/:id')
    .get(regionController.view)
    .put(regionController.update)
    .delete(regionController.delete);

router.route('/region/:id/churches')
    .get(regionController.churches);

router.route('/region_list')
    .get(regionController.index);


module.exports = router;
