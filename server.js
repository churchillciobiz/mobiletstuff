const express = require('express');
const mysql = require('mysql');
var jwt = require('jsonwebtoken');
const upload = require('express-fileupload');
const resizer = require('node-image-resizer');
const path = require('path');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Multipart/form-data");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(upload());
var server = app.listen(process.env.PORT || '8080', ()=> {
	console.log(`Server is running on port: ${process.env.PORT || '8080'}`);
});

//Create db connection
const db = mysql.createConnection({
	host : 'localhost',
	user: 'root',
	password: 'root',
	database: 'mobiletdb'
});

//Connect
db.connect((err) => {
	if(err){
		console.log(err);
	}else{
	console.log("Mysql connected ...");
	}
});
app.get('/getthis', (request, response) => {
  response.json({"message":"success"});
});
app.post('/postthis', (request, response) => {
  response.json({"message":"success", "content":request.body.number});
});
app.post('/login', (request, response) => {
	let sql  = `SELECT * FROM members WHERE email_address='${request.body.email}' AND pass_code='${request.body.vCode}'`;
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		if(result && result.length) {
			jwt.sign({member: result}, "secretKey", (error, token)=>{
          response.json({"message": "user in db", "token":token});
        });
		}else {
			response.send({message: "wrong passcode"});
		}
	});
});
app.post('/logineventsdash', (request, response) => {
	let sql  = `SELECT * FROM event_members WHERE email_address='${request.body.email}' AND pass_code='${request.body.vCode}'`;
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		if(result && result.length) {
			jwt.sign({member: result}, "secretKey", (error, token)=>{
          response.json({"message": "user in db", "token":token});
        });
		}else {
			response.send({message: "wrong passcode"});
		}
	});
});
app.post('/applogin', (request, response) => {
  console.log("hitting");
	response.json([{"success":"1", "login": [{"id":result.user_id, "email":result.email_address, "name":result.full_names}]}]);
});

app.post('/mobiletapplogin', (request, response) => {
  console.log("hitting");
	let sql  = `SELECT * FROM members WHERE email_address='${request.body.email}' AND pass_code='${request.body.password}'`;
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		if(result && result.length) {
        response.json([{"success":true, "id":result.user_id, "email":result.email_address, "name":result.full_names}]);
		}else {
			response.send({message: "wrong passcode"});
		}
	});
});

app.post('/registermobilet', (request, response) => {
	console.log("it")
	let sql  = `INSERT INTO members (full_names, pass_code, last_active, email_address, member_image) VALUES ('${request.body.fullNames}', '${request.body.passCode}', NOW(), '${request.body.email}', "null")`;
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		if(result){
				jwt.sign({memberId:result.insertId, memberEmail:request.body.email}, "secretKey", (error, token)=>{
          	response.json({"message": "user added", "token":token});
        });
		}else {
			response.send({message: "cannot insert in data"});
		}
	});
});
app.post('/registereventmobilet', (request, response) => {
	console.log("it")
	let sql  = `INSERT INTO event_members (full_names, pass_code, last_active, email_address, member_image) VALUES ('${request.body.fullNames}', '${request.body.passCode}', NOW(), '${request.body.email}', "null")`;
	let query = db.query(sql, (err, result)=>{
		if(err) throw err;
		if(result){
				jwt.sign({memberId:result.insertId, memberEmail:request.body.email}, "secretKey", (error, token)=>{
          	response.json({"message": "user added", "token":token});
        });
		}else {
			response.send({message: "cannot insert in data"});
		}
	});
});
app.post("/getcategories", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM categories WHERE member_id ='${userData.member[0].user_id}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your categories","data":result});
				}else {
					response.json({"message":"no categories"});
				}
			});
		}
  });
});
app.post("/getevents", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM events WHERE member_id ='${userData.member[0].user_id}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your events","data":result});
				}else {
					response.json({"message":"no categories"});
				}
			});
		}
  });
});
app.post("/getitemcategories", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM categories WHERE member_id ='${userData.member[0].user_id}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your categories","data":result});
				}else {
					response.json({"message":"no categories"});
				}
			});
		}
  });
});
app.post("/getalleventscategories", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM event_type`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your event types","data":result});
				}else {
					response.json({"message":"no event types"});
				}
			});
		}
  });
});
app.post("/getallitems", verifyToken, (request, response)=>{
  console.log(request.body.subcategoryId)
  console.log(request.body.branchId)
  console.log(request.body.categoryId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM inventory_items WHERE member_id ='${userData.member[0].user_id}' AND category_id='${request.body.categoryId}' AND subcategory_id='${request.body.subcategoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
       // console.log(result)
				if(result && result.length) {
          response.json({"data": result});
				}else {
					response.json({"message":"no items"});
				} 
    });  
  }
  });
});

app.post("/getitemsinbranch", verifyToken, (request, response)=>{
  console.log(request.body.subCategoryId)
  console.log(request.body.branchId)
  console.log(request.body.categoryId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    if(err){
      response.sendStatus(403);
    }else{
      let sql = `SELECT * FROM branch_items WHERE branch_id ='${request.body.branchId}' && category_id ='${request.body.categoryId}' && subcategory_id ='${request.body.subCategoryId}'`;
      if(err){
        response.sendStatus(403);
      }else{
        let query = db.query(sql, (err, result)=>{
          if(err) throw err;
          if(result) {
            response.json({"message":"your items","data":result});
          }else {
            response.json({"message":"no items"});
          }
        });
      }

    }
  });
});

app.post("/getcategoryinfo", verifyToken, (request, response)=>{
  console.log(request.body.categoryId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM categories WHERE member_id ='${userData.member[0].user_id}' && category_id ='${request.body.categoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your categories","data":result});
				}else {
					response.json({"message":"no category"});
				}
			});
    }
  });
});

app.post("/updatecategory", verifyToken, (request, response)=> {
  console.log(request.body.categoryName,request.body.imageUrl,request.body.categoryId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `UPDATE categories SET category_name='${request.body.categoryName}', image_url = '${request.body.imageUrl}' WHERE category_id = '${request.body.categoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
			//	console.log(result)
				if(result) {
          response.json({"message":"category updated"});
				}else {
					response.json({"message":"no category updated "+err});
				}
			});
    }
  })
});

app.post("/getsubcategories", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM categorysubcategories WHERE member_id ='${userData.member[0].user_id}' AND category_id='${request.body.categoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"data":result});
				}else {
					response.json({"message":"no comments"});
				}
			}); 
    }
  });
});



app.post("/getitems", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM inventory_items WHERE member_id ='${userData.member[0].user_id}' AND category_id='${request.body.categoryId}' AND subcategory_id='${request.body.subcategoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"data":result});
				}else {
					response.json({"message":"no items"});
				} 
    });
  }
  });
});

app.post("/getiteminfo", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM inventory_items WHERE items_id='${request.body.itemId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"data":result});
				}else {
					response.json({"message":"no items"});
				} 
    });
  }
  });
});

app.post("/updateitem", verifyToken, (request, response)=> {
  console.log(request.body.itemName,request.body.imageUrl,request.body.itemId, request.body.price, request.body.itemDescription);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `UPDATE inventory_items SET item_name='${request.body.itemName}', img = '${request.body.imageUrl}', price='${request.body.price}', description='${request.body.itemDescription}' WHERE items_id = '${request.body.itemId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
			//	console.log(result)
				if(result) {
          response.json({"message":"item edited"});
				}else {
					response.json({"message":"no item updated "+err});
				}
			});
    }
  })
});

app.post("/insertsubcategory", verifyToken, (request, response)=>{
  console.log(request.body.categoryId);
  console.log(request.body.subcategoryName)
jwt.verify(request.token,"secretKey",(err,userData)=>{
  let sql  = `INSERT INTO categorysubcategories (member_id, category_id, subcategory_name) VALUES ('${userData.member[0].user_id}', '${request.body.categoryId}', '${request.body.subcategoryName}')`;
  if(err){
    response.sendStatus(403);
  }else{
    let query = db.query(sql, (err, result)=>{
      if(err) throw err;
      if(result){
        response.json({"message":"a new sub category has been added"});
      }else {
        response.send({message: "cannot insert in data"});
      }
    });
  }
})
});



app.post("/getbranches", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM branch WHERE member_id ='${userData.member[0].user_id}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"branches","data":result});
				}else {
					response.json({"message":"no branch"});
				}
			});
		}
  });
});

app.post("/insertnewcategory", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(userData.member[0].user_id);
    let sql  = `INSERT INTO categories (member_id, category_name, image_url, when_created) VALUES ('${userData.member[0].user_id}', '${request.body.categoryName}', '${request.body.imageUrl}', NOW())`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"a new category has been added", "categoryName":request.body.categoryName, "imgUrl":request.body.imageUrl});
    		}else {
    			response.send({message: "cannot insert in data"});
    		}
    	});
    }
  })
});
app.post("/addactor", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql  = `INSERT INTO event_actor (event_id, actor_name, img, actor_function, description) VALUES ('${request.body.eventId}', '${request.body.actorName}', '${request.body.img}', '${request.body.function}', '${request.body.description}')`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"a new actor has been added", "actorName":request.body.actorName});
    		}else {
    			response.send({message: "cannot insert in data"});
    		}
    	});
    }
  })
});
app.post("/insertnewevent", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(userData.member[0].user_id);
    let sql  = `INSERT INTO events (member_id, event_name, image_url, description, physical_location, lng, lat, alt, start_date, end_date, start_time, end_time, when_created, event_type_id, start_ampm, end_ampm, number_people, headline) VALUES ('${userData.member[0].user_id}', '${request.body.eventName}', '${request.body.imageUrl}', '${request.body.eventDescription}', '${request.body.eventLocation}', '${request.body.lng}', '${request.body.lat}', '${request.body.alt}', '${request.body.startDate}', '${request.body.endDate}', '${request.body.startTime}', '${request.body.endTime}', NOW(), '${request.body.eventType}', '${request.body.startTimeAmPm}', '${request.body.endTimeAmPm}', '${request.body.numberPeople}', '${request.body.headline}')`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"a new event has been added", "eventId":result.insertId});
    		}else {
    			response.send({message: "cannot insert in data"});
    		}
    	});
    }
  })
});

app.post("/addeventtarget", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(userData.member[0].user_id);
    let sql  = `INSERT INTO event_pricing (event_id, audience_type, charge) VALUES ('${request.body.eventId}', '${request.body.audience}', '${request.body.cost}')`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"event target added"});
    		}else {
    			response.send({message: "cannot insert in data"});
    		}
    	});
    }
  })
});
app.post("/addeventimgs", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(userData.member[0].user_id);
    let sql  = `INSERT INTO event_imgs (img ,event_id, description) VALUES ('${request.body.eventImg}', '${request.body.eventId}', '${request.body.description}')`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"event img added"});
    		}else {
    			response.send({message: "cannot insert in data"});
    		}
    	});
    }
  })
});
app.post("/getitemsfromsubs", verifyToken, (request, response)=>{
  // console.log(req.body.categoryId,req.body.subCategoryId)
   jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM inventory_items WHERE category_id ='${request.body.categoryId}' AND subcategory_id='${request.body.subCategoryId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"data":result});
				}else {
					response.json({"message":"no items"});
				} 
    });
  }
   });
 });

 app.post("/geteventactors/", verifyToken, (request, response)=>{
  // console.log(req.body.categoryId,req.body.subCategoryId)
   jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `SELECT * FROM event_actor WHERE event_id ='${request.body.eventId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"data":result});
				}else {
					response.json({"message":"no items"});
				} 
    });
  }
   });
 });

 app.post("/getbranchinfo", verifyToken, (request, response)=>{
  console.log(request.body.branchId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
  let sql = `SELECT * FROM branch WHERE member_id='${userData.member[0].user_id}' AND branch_id='${request.body.branchId}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result) {
					response.json({"message":"branch","data":result});
				}else {
					response.json({"message":"no branch"});
				}
			});
    }
  });
});

app.post("/updatebranch", verifyToken, (request, response)=> {
  console.log(request.body.branchName,request.body.imageUrl,request.body.branchId);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql = `UPDATE branch SET branch_name='${request.body.branchName}', branch_img = '${request.body.imageUrl}', branch_location_physical='${request.body.branchLocation}', branch_description='${request.body.branchDescription}' WHERE branch_id = '${request.body.branchId}'`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
			//	console.log(result)
				if(result) {
          response.json({"message":"branch edited"});
				}else {
					response.json({"message":"no branch updated "+err});
				}
			});
    }
  })
});

app.post("/additemstobranch", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(request.body.branchId, request.body.itemListIds);
    if(err){
      response.sendStatus(403);
    }else{
      for(var i=0;i<request.body.itemListIds.length;i++){
        let sql = `SELECT * FROM inventory_items WHERE member_id='${userData.member[0].user_id}' AND items_id='${request.body.itemListIds[i]}'`;
        let query = db.query(sql, (err, result)=>{
          console.log(result);
          if(err) throw err;
          else if(result) {
            //response.json({"message":"branch","data":result});
            console.log(result[0].category_id)
            let sql  = `INSERT INTO branch_items (branch_id, category_id, subcategory_id, item_id, item_name, category, price, img) VALUES ('${request.body.branchId}', '${result[0].category_id}', '${result[0].subcategory_id}', '${result[0].items_id}', '${result[0].item_name}', '${result[0].category}', '${result[0].price}', '${result[0].img}')`;
            if(err){
              response.sendStatus(403);
            }else{
              let query = db.query(sql, (err, result)=>{
                if(err) throw err;
                console.log(result);
                
              });
            }
            
          }
        });
      }response.json({"message": "upload complete"});
    }
  });
});

app.post("/insertinventory", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql  = `INSERT INTO inventory_items (category, item_name, price, description, img, member_id, category_id, subcategory_id) VALUES ('${request.body.dishCategory}', '${request.body.dishName}', '${request.body.dishPrice}', '${request.body.dishDescription}','${request.body.dishFolder}', '${userData.member[0].user_id}', '${request.body.categoryId}', '${request.body.subCategoryId}')`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"a new item has been added"});
    		}else {
    			response.json({"message": "cannot insert in data"});
    		}
    	});
    }
  })
});

app.post("/getcomments", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    console.log(userData.member[0])
		let sql = `SELECT * FROM branchcomments WHERE admin_email='${userData.member[0].email_address}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your comments","data":result});
				}else {
					response.json({"message":"no comments"});
				}
			});
		}
  });
});
app.post("/insertnotes", verifyToken, (request, response)=>{
    var date = new Date();
    var time = formatAMPM(date);
    jwt.verify(request.token, "secretKey", (err, userData)=> {
      let sql  = `INSERT INTO mobilet_dashboard_notes (member_id, note_name, note_type, image_url, when_posted) VALUES ('${userData.member[0].user_id}', '${request.body.named}', '${request.body.noteType}', '${request.body.imageUrl}', NOW())`;
    if(err){
      response.sendStatus(403);
    }else{
      let query = db.query(sql, (err, result)=>{
    		if(err) throw err;
    		if(result){
          response.json({"message":"a new note has been added"});
    		}else {
    			response.json({"message": "cannot insert in data"});
    		}
    	});
    }
  });
});
app.post("/insertnewbranch", verifyToken, (request, response)=>{
  var date = new Date();
  var time = formatAMPM(date);
  jwt.verify(request.token, "secretKey", (err, userData)=> {
    let sql  = `INSERT INTO branch (member_id, branch_name, branch_location_physical, branch_lat, branch_log, branch_alt, branch_img, branch_description, when_posted) VALUES ('${userData.member[0].user_id}', '${request.body.branchName}', '${request.body.physicalLocation}', '${request.body.lat}', '${request.body.long}', '${request.body.alt}', '${request.body.img}', '${request.body.branchDescription}', '${time}')`;
  if(err){
    response.sendStatus(403);
  }else{
    let query = db.query(sql, (err, result)=>{
      if(err) throw err;
      if(result){
        response.json({"message":"a new branch has been added", "branchName":request.body.branchName, "imgUrl":request.body.img});
      }else {
        response.json({"message": "cannot insert in data"});
      }
    });
  }
});
});
app.post("/getnotes", verifyToken, (request, response)=>{
  jwt.verify(request.token, "secretKey", (err, userData)=> {
		let sql = `SELECT * FROM mobilet_dashboard_notes WHERE member_id='${userData.member[0].user_id}'`;
    if(err){
      response.sendStatus(403);
    }else{
			let query = db.query(sql, (err, result)=>{
				//if(err) throw err;
				if(result && result.length) {
					response.json({"message":"your notes","data":result});
				}else {
					response.json({"message":"no notes"});
				}
			});
		}
  });
});
app.post('/uploadimage2', (req,resp)=>{
  var images = new Array();
  var fileName ="";
  if(req.files){
    var arr;
    if(Array.isArray(req.files.filesfld2)){
      arr = req.files.filesfld2;
      //console.log(req.files.filesfld);
    }else{
      arr = new Array(1);
     // console.log(req.files.filesfld);
      arr[0] = req.files.filesfld2;
    }
      for(var i=0; i<arr.length; i++){
        var file = arr[i];
        if(file.mimetype.substring(0, 5).toLowerCase()=="image"){
          images[i] = "./"+file.name;
          console.log(images[i])
          fileName = file.name;
          file.mv("./images/"+images[i], (error)=>{
            if(error){
              console.log(error);
            }
          });
        }
      }
    }


    const setup = {
    all: {
      path: './public/thumbnails/',
      quality: 80
    },
    versions: [{
      prefix: 'big_',
      width: 1024,
      height: 768
    }, {
      prefix: 'medium_',
      width: 512,
      height: 256
    }, {
      quality: 100,
      prefix: 'small_',
      width: 128,
      height: 64
    }]
  };

  // create thumbnails
  const thumbs = resizer("./images/"+fileName, setup);

  var thumb = `../././public/thumbnails/small_${fileName}`;
  setTimeout(function(){
    resp.json(thumb);
  }, 1000);
});
app.post('/uploadimage3', (req,resp)=>{
  var images = new Array();
  var fileName ="";
  if(req.files){
    var arr;
    if(Array.isArray(req.files.filesfld3)){
      arr = req.files.filesfld3;
      //console.log(req.files.filesfld);
    }else{
      arr = new Array(1);
     // console.log(req.files.filesfld);
      arr[0] = req.files.filesfld3;
    }
      for(var i=0; i<arr.length; i++){
        var file = arr[i];
        if(file.mimetype.substring(0, 5).toLowerCase()=="image"){
          images[i] = "./"+file.name;
          console.log(images[i])
          fileName = file.name;
          file.mv("./images/"+images[i], (error)=>{
            if(error){
              console.log(error);
            }
          });
        }
      }
    }


    const setup = {
    all: {
      path: './public/thumbnails/',
      quality: 80
    },
    versions: [{
      prefix: 'big_',
      width: 1024,
      height: 768
    }, {
      prefix: 'medium_',
      width: 512,
      height: 256
    }, {
      quality: 100,
      prefix: 'small_',
      width: 128,
      height: 64
    }]
  };

  // create thumbnails
  const thumbs = resizer("./images/"+fileName, setup);

  var thumb = `../././public/thumbnails/small_${fileName}`;
  setTimeout(function(){
    resp.json(thumb);
  }, 1000);
});
app.post('/uploadimage1', (req,resp)=>{
  var images = new Array();
  var fileName ="";
  if(req.files){
    var arr;
    if(Array.isArray(req.files.filesfld1)){
      arr = req.files.filesfld1;
      //console.log(req.files.filesfld);
    }else{
      arr = new Array(1);
     // console.log(req.files.filesfld);
      arr[0] = req.files.filesfld1;
    }
      for(var i=0; i<arr.length; i++){
        var file = arr[i];
        if(file.mimetype.substring(0, 5).toLowerCase()=="image"){
          images[i] = "./"+file.name;
          console.log(images[i])
          fileName = file.name;
          file.mv("./images/"+images[i], (error)=>{
            if(error){
              console.log(error);
            }
          });
        }
      }
    }


    const setup = {
    all: {
      path: './public/thumbnails/',
      quality: 80
    },
    versions: [{
      prefix: 'big_',
      width: 1024,
      height: 768
    }, {
      prefix: 'medium_',
      width: 512,
      height: 256
    }, {
      quality: 100,
      prefix: 'small_',
      width: 128,
      height: 64
    }]
  };

  // create thumbnails
  const thumbs = resizer("./images/"+fileName, setup);

  var thumb = `../././public/thumbnails/small_${fileName}`;
  setTimeout(function(){
    resp.json(thumb);
  }, 1000);
});
app.post('/uploadimage', (req,resp)=>{
  var images = new Array();
  var fileName ="";
  if(req.files){
    var arr;
    if(Array.isArray(req.files.filesfld)){
      arr = req.files.filesfld;
      //console.log(req.files.filesfld);
    }else{
      arr = new Array(1);
     // console.log(req.files.filesfld);
      arr[0] = req.files.filesfld;
    }
      for(var i=0; i<arr.length; i++){
        var file = arr[i];
        if(file.mimetype.substring(0, 5).toLowerCase()=="image"){
          images[i] = "./"+file.name;
          console.log(images[i])
          fileName = file.name;
          file.mv("./images/"+images[i], (error)=>{
            if(error){
              console.log(error);
            }
          });
        }
      }
    }


    const setup = {
    all: {
      path: './public/thumbnails/',
      quality: 80
    },
    versions: [{
      prefix: 'big_',
      width: 1024,
      height: 768
    }, {
      prefix: 'medium_',
      width: 512,
      height: 256
    }, {
      quality: 100,
      prefix: 'small_',
      width: 128,
      height: 64
    }]
  };

  // create thumbnails
  const thumbs = resizer("./images/"+fileName, setup);

  var thumb = `../././public/thumbnails/medium_${fileName}`;
  setTimeout(function(){
    resp.json(thumb);
  }, 1000);
});

function verifyToken(req, resp, next){
  const bearerHeader = req.headers["authorization"];
  //check if bearer is undefined
  if(typeof bearerHeader !== "undefined"){
    //split at the space
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  }else{
    //forbidden
    resp.sendStatus(403);
  }
}

function formatAMPM(date){
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0"+minutes : minutes;
  var strTime = hours+":"+minutes+" "+ampm+" on "+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
  return strTime;
}
