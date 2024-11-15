var utils = require('../Utils/utils');

// импортируем модуль bcrypt для шифрования паролей
var bcrypt = require('bcrypt');

// импортируем JWT для декодирования web-token'ов
var jwt = require('jsonwebtoken');

var config = require('../config');
var token = require('../Token/tokenController');
var randtoken = require('rand-token');
var ObjectID = require('mongodb').ObjectID;

var multer = require('multer');

var usrpics = 'usrpics/';

User = require('./userModel');
Parish = require('../Parish/parishModel');

var Cell = require('../Cell/cellController');

var groups = [ null, 'cell', 'century', 'church', 'region', 'super_region','archbishop' ];

function ISO8601_week_no(dt) {
	var tdt = new Date(dt.valueOf());
	var dayn = (dt.getDay() + 6) % 7;
	tdt.setDate(tdt.getDate() - dayn + 3);
	var firstThursday = tdt.valueOf();
	tdt.setMonth(0, 1);
	if (tdt.getDay() !== 4) {
		tdt.setMonth(0, 1 + (4 - tdt.getDay() + 7) % 7);
	}
	return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

//handle getting users list
exports.index = function(req, res) {
	if (token.check(req, res) == true) {
		User.get(function(err, users) {
			if (err) {
				res.json({ status: 'error', message: err });
			}
			res.json(users);
		});
	}
};

//user login function getting email/password,returning token

exports.checkRights = function(role, groupID, req) {
	
	let groups_ids = req.session.user[groups[Number(role)]].map((item)=>{return item["_id"]});


	if ((
		req.session.user &&
		req.session.user.role.contains(role) && 
		role!==5&&
		(groups_ids.contains(groupID.toString())||groupID=='new') 
	)||(
		req.session.user &&
		req.session.user.role.contains(role) && role==5
	)||
	(
		req.session.user &&
		req.session.user.role.contains(role)&&
		role!==5&&
		groups_ids.contains(req.body[groups[Number(role)]])
	)
	/*||(
		req.session.user &&
		req.session.user.role.contains(role+1)&&
		role!==5&&
		req.session.user[groups[Number(role+1)]]&&
		req.session.user[groups[Number(role+1)]].contains(req.body[groups[Number(role+1)]])
	)*/
	
	) {
		if(groupID=='new')return 'new';
		return true;
	} else {
		return false;
	}
};


exports.loginInfo = function(req, res, next) {
	if (token.check(req, res) == true) {
		User.findOne({ _id: jwt.decode(req.headers['x-auth']).id }).populate('cell').populate('century').populate('church').populate('region').exec(function(err, user) {
			if (err) res.send(err);
			req.session.user = user; //add to session variable full current user info
			res.send(user);
		});
	}
};

exports.addGroup = function(req,res,role,user_id,group_id,group){


		User.findById(user_id, function(err, user) {
			if (err) res.send(err);

			if(user){user[groups[Number(role)]].push(group_id);
			

			user.save(function(err) {
				if (err) res.json(err);
				res.json({
					message: group,
					data: user
				});
			});

		}
		});
	

}

//handle create new user
exports.new = function(req, res) {
	var user = new User();
	user._id = new ObjectID();
	user.name = req.body.name ? req.body.name : user.name;
	user.surname = req.body.surname ? req.body.surname : user.surname;
	user.birthday = req.body.birthday ? req.body.birthday : user.birthday;
	//   user.sex = req.body.sex?req.body.sex:user.sex;
	user.userpic = 'https://' + req.headers.host + '/' + usrpics + user._id + '.jpg';
	user.phone = req.body.phone ? req.body.phone : user.phone;
	//     user.address = req.body.address?req.body.address:user.address;
	user.email = req.body.email ? req.body.email : user.email;
	user.role = req.body.role ? req.body.role : user.role;

		user.cell = req.body.cell ? req.body.cell : user.cell;

		user.century = req.body.century ? req.body.century : user.century;

		user.church = req.body.church ? req.body.church : user.church;

		user.region = req.body.region ? req.body.region : user.region;
	
	//console.log(user._id);

	// user.password = req.body.password;

	// user.activity = req.body.activity?req.body.activity:user.activity;
	//user.activity.push({ week: '777' });

	//saving password as hash
	var password = req.body.password;
	bcrypt.hash(password, 10, function(err, hash) {
		if (err) {
			res.send(err);
		} else {
			user.password = hash;

			user.save(function(err) {
				if (err) res.json({ status: 'error', message: err });
				else {
					res.status(201).json({ status: 'created', _id: user._id });
				}
			});
		}
	});
};

//handle view User info
exports.view = function(req, res) {
	if (token.check(req, res) == true) {
		User.findById(req.params.id, function(err, user) {
			if (err) res.send(err);
			res.json(user);
		});
	}
};
//handle patch array based user's info
exports.patch = function(req, res) {
	if (token.check(req, res) == true) {
		User.findById(req.params.id, function(err, user) {
			if (err) res.send(err);

			req.body.role && !user.role.contains(req.body.role) && user.role.push(req.body.role);
			req.body.cell && !user.cell.contains(req.body.cell) && user.cell.push(req.body.cell);
			req.body.century && !user.century.contains(req.body.century) && user.century.push(req.body.century);
			req.body.church && !user.church.contains(req.body.church) && user.church.push(req.body.church);
			req.body.region && !user.region.contains(req.body.region) && user.region.push(req.body.region);

			user.save(function(err) {
				if (err) res.json(err);
				user.populate(
					['cell','region','church','century'], function(err, user) {
						   if(err) {
							 console.log(err);
						   }
						   else {
							res.json({
								message: 'User info updated',
								data: user
							})  
							} 
				 });
			});
		});
	}
};

//handle update user's info
exports.update = function(req, res) {
	if (token.check(req, res) == true) {
		User.findById(req.params.id, function(err, user) {
			if (err) res.send(err);

			user.name = req.body.name ? req.body.name : user.name;
			user.surname = req.body.surname ? req.body.surname : user.surname;
			user.birthday = req.body.birthday ? req.body.birthday : user.birthday;
			// user.sex = req.body.sex?req.body.sex:user.sex;
			user.userpic = req.body.userpic ? req.body.userpic : user.userpic;
			user.phone = req.body.phone ? req.body.phone : user.phone;
			// user.address = req.body.address?req.body.address:user.address;
			user.email = req.body.email ? req.body.email : user.email;
			user.cell = req.body.cell ? req.body.cell : user.cell;
			user.role = req.body.role ? req.body.role : user.role;

			user.church = req.body.church ? req.body.church : user.church;
			user.century = req.body.century ? req.body.century : user.century;
			user.region = req.body.region ? req.body.region : user.region;

			user.save(function(err) {
				if (err) res.json(err);

				/*res.json({
					message: 'User info updated',
					data: user
				});*/


				user.populate(
					['cell','region','church','century'], function(err, user) {
						   if(err) {
							 console.log(err);
						   }
						   else {
							res.json({
								message: 'User info updated',
								data: user
							})  
							} 
				 });

			});
		});
	}
};

//Handle delete user
exports.delete = function(req, res) {
	if (token.check(req, res) == true) {
		User.remove(
			{
				_id: req.params.id
			},
			function(err, user) {
				if (err) res.send(err);
				res.json({
					status: 'success',
					message: 'User deleted'
				});
			}
		);
	}
};

//handle getting users list
exports.beard = function(req, res) {
	let now = new Date();
	if (token.check(req, res) == true) {
		var group_query = {};
		group_query[groups[Number(req.params.role)].toString()] = req.params.group_id.toString();


		if (req.params.role > 1) {
			//if user role more than Leader
			if(req.params.role<5){
			User.find({ $and: [ group_query, { role: { $eq: req.params.role - 1 } } ]}).populate('cell').populate('century').populate('church').populate('region').exec(function(err, users) {
				res.json(users);
			});
		}else{
	
			if(req.session.user){
		
			if(req.params.role==5&&req.session.user.role.contains(5)&&req.session.user._id==req.params.id){
	
			User.find({role:4}).populate('cell').populate('century').populate('church').populate('region').exec(function(err, users) {
				res.json(users);
			});
		}else{return res.sendStatus(401);}
		}else{
			return res.sendStatus(401);
		}
		}


		} else {
			//if user role is Leader - get parishes from cellgroup with group_id
			if (req.params.role == 1) {
				Parish.find({ cell: req.params.group_id })
					.select({
						//return just current week in activity
						_id: 1,
						name: 1,
						surname: 1,
						birthday: 1,
						userpic: 1,
						phone: 1,
						address: 1,
						role: 1,
						cell: 1,
						century: 1,
						church: 1,
						region: 1,
						activity: {
							$elemMatch: {
								week: ISO8601_week_no(now),
								year: now.getFullYear()
							}
						}
					}).populate('cell').populate('century').populate('church').populate('region')
					.exec(function(err, parishes) {
						res.json(parishes);
					});
			}
		}
	}
};

function parish_check(user_id, parish_id, group_id, res) {
	User.findById(user_id, function(err, user) {
		if (err) res(false);

		if (user && user.cell.contains(group_id)) {
			Parish.findById(parish_id, function(err, parish) {
				if (parish && parish.cell.toString() == group_id.toString()) {
					res(true);
				} else {
					res(false);
				}
			});
		} else {
			res(false);
		}
	});
}

//handle create new parish
exports.new_parish = function(req, res) {
	if (token.check(req, res) == true) {
		User.findById(req.params.id, function(err, user) {
			if (err) res.json({ status: 'error', message: err });

			if (user.cell.contains(req.body.cell)) {
				var parish = new Parish();
				parish._id = new ObjectID();
				parish.name = req.body.name ? req.body.name : parish.name;
				parish.surname = req.body.surname ? req.body.surname : parish.surname;
				parish.birthday = req.body.birthday ? req.body.birthday : parish.birthday;
				parish.userpic = 'https://' + req.headers.host + '/' + usrpics + parish._id + '.jpg';
				parish.phone = req.body.phone ? req.body.phone : parish.phone;
				parish.address = req.body.address ? req.body.address : parish.address;
				parish.role = 0;
				parish.cell = req.body.cell ? req.body.cell : parish.cell;
				parish.role = req.body.role ? req.body.role : parish.role;
				parish.church = req.body.church ? req.body.church : parish.church;
				parish.century = req.body.century ? req.body.century : parish.century;
				parish.region = req.body.region ? req.body.region : parish.region;

				let now = new Date();

				parish.activity.push({
					year: now.getFullYear(),
					week: ISO8601_week_no(now),
					cell: 1,
					sun: 1
				});

				parish.save(function(err) {
					if (err) res.json({ status: 'error', message: err });
					else {
						res.status(201).json({ status: 'created', _id: parish._id });
					}
				});
			} else {
				res.json({ status: 'error', message: 'wrong cell' });
			}
		});
	}
};

//Handle delete parish
exports.delete_parish = function(req, res) {
	if (token.check(req, res) == true) {
		parish_check(req.params.id, req.params.parish_id, req.params.group_id, function(result) {
			if (result == true) {
				Parish.deleteOne({
					_id: req.params.parish_id
				}).exec(function(err, parish) {
					if (err) res.send(err);

					res.json({
						status: 'success',
						message: parish
					});
				});
			} else {
				res.json({
					status: 'error',
					message: 'ERROR'
				});
			}
		});
	}
};
//view parish info
exports.view_parish = function(req, res) {
	let now = new Date();
	if (token.check(req, res) == true) {
		parish_check(req.params.id, req.params.parish_id, req.params.group_id, function(result) {
			if (result == true) {
				Parish.findById(req.params.parish_id)
					.select({
						//return just current week in activity
						name: 1,
						surname: 1,
						birthday: 1,
						userpic: 1,
						phone: 1,
						address: 1,
						cell: 1,
						role: 1,
						century: 1,
						church: 1,
						region: 1,
						activity: {
							$elemMatch: {
								week: ISO8601_week_no(now),
								year: now.getFullYear()
							}
						}
					}).populate('cell').populate('century').populate('church').populate('region')
					.exec(function(err, parish) {
						if (err) res.send(err);
						res.json(parish);
					});
			}
		});
	}
};

//handle update parish's info
exports.update_parish = function(req, res) {
	if (token.check(req, res) == true) {
		parish_check(req.params.id, req.params.parish_id, req.params.group_id, function(result) {
			if (result == true) {
				Parish.findById(req.params.parish_id, function(err, parish) {
					if (err) res.send(err);
					if (parish) {
						parish.name = req.body.name ? req.body.name : parish.name;
						parish.surname = req.body.surname ? req.body.surname : parish.surname;
						parish.birthday = req.body.birthday ? req.body.birthday : parish.birthday;
						parish.userpic = req.body.userpic ? req.body.userpic : parish.userpic;
						parish.phone = req.body.phone ? req.body.phone : parish.phone;
						parish.address = req.body.address ? req.body.address : parish.address;

						parish.cell = req.body.cell ? req.body.cell : parish.cell;
						parish.role = req.body.role ? req.body.role : parish.role;
						parish.church = req.body.church ? req.body.church : parish.church;
						parish.century = req.body.century ? req.body.century : parish.century;
						parish.region = req.body.region ? req.body.region : parish.region;

						parish.save(function(err) {
							if (err) res.json(err);
							res.json({
								message: 'User info updated'
								// data: parish
							});
						});
					} else {
						res.send(err);
					}
				});
			}
		});
	}
};

exports.parish_activity_add = function(req, res) {
	if (token.check(req, res) == true) {
		parish_check(req.params.id, req.params.parish_id, req.params.group_id, function(result) {
			if (result == true) {
				Parish.findById(req.params.parish_id, function(err, parish) {
					if (err) res.send(err);
					let now = new Date();
					var date = new Date(req.body.date + 'T00:00:00Z');
					var year = req.body.date ? date.getUTCFullYear() : now.getUTCFullYear();
					var week = req.body.date ? ISO8601_week_no(date) : ISO8601_week_no(now);

					//check if same year/week combination presents.
					var ind = parish.activity.findIndex((x) => x && x.year == year && x.week == week);

					if (ind != -1) {
						//  req.body.cell ? req.body.cell : parish.cell;
						if (req.body.sun) parish.activity[ind].sun = req.body.sun;
						if (req.body.cell) parish.activity[ind].cell = req.body.cell;
					} else {
						parish.activity.push({
							year: year,
							week: week,
							cell: req.body.cell,
							sun: req.body.sun
						});
					}

					parish.save(function(err) {
						if (err) res.json(err);
						res.json({
							message: 'Parish info updated'
							//  data: parish
						});
					});
				});
			}
		});
	}
};

exports.upload_photo = function(req, res) {
	var user_id = req.params.id;
	if (token.check(req, res) == true) {
		const storage = multer.diskStorage({
			destination: (req, file, callback) => {
				//save userpics in a folder next to backend folder
				callback(null, '../' + usrpics);
			},
			filename: (req, file, callback) => {
				callback(null, user_id + '.jpg');
			}
		});

		const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 2 } }).any('file');
		//filesize limit is 2mb;
		upload(req, res, (err) => {
			if (err) {
				return res.status(400).send({
					message: err
				});
			}
			let results = req.files.map((file) => {
				return {
					mediaName: file.filename,
					origMediaName: file.originalname,
					mediaSource: 'https://' + req.headers.host + '/' + usrpics + file.filename
				};
			});
			res.status(200).json(results);
		});
	}
};
