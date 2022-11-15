const sql = require("../config/db_connection.js");
const moment = require('moment-timezone');
const tzone = "Asia/Kolkata";

// constructor
const User = function(user) {
  this.email = user.email;
  this.first_name = user.first_name;
  this.contact = user.contact;
  this.user_type = 0;
};

//Generate a username for user
User.generateUsername = (first_name) => {
  let ustr = first_name.trim();
  return ustr + '_' + Math.floor(Math.random() * (999 - 1) + 1);
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO gos_users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId });
    result(null, { id: res.insertId });
  });
};

User.findById = (userId, result) => {
  sql.query(`SELECT * FROM gos_users WHERE id = ${userId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      //console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

//Find a user by email
User.findByEmail = (email, result) => {
  sql.query("SELECT * FROM gos_users WHERE email = '" + email + "'", (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      //console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result(null, { kind: "not_found" });
  });
};

User.getAll = result => {
  sql.query("SELECT u.* FROM gos_users u  ORDER BY u.id DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    //console.log("users: ", res);
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE gos_users SET ? WHERE id = ?",
    [user, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated user: ", { id: id });
      result(null, { id: id });
    }
  );
};

User.remove = (id, result) => {
  sql.query("DELETE FROM gos_users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user with id: ", id);
    result(null, res);
  });
};

User.removeAll = result => {
  sql.query("DELETE FROM gos_users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

User.changeUserStatusById = (id, updateData, result) => {
  sql.query(
    "UPDATE gos_users SET status=?,updated_date=? WHERE id = ?",
    [updateData.status,updateData.updated_date, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log("updated status: ", { id: id });
      result(null, { result: 'success', userStatus: updateData.status });
    }
  );
}

User.changePasswordById = (id, password, result) => {
  sql.query(
    "UPDATE gos_users SET password=? WHERE id = ?",
    [password, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log("updated password: ", { id: id });
      result(null, { result: 'success', userPassword: password });
    }
  );
}


User.ajaxUserList =  (tagDataobj, result)  => {

  var dataArr = [];
  var iTotalRecords=0;
  var iTotalDisplayRecords=0;
  var limit = "  LIMIT  "+tagDataobj.row + ',' + tagDataobj.rowperpage;
  console.log(limit);

  console.log(tagDataobj.searchStr);
  let where = '1=1 AND user_type != 1';
  if(tagDataobj.searchStr.search_key){

    where = " AND (u.username LIKE '%"+tagDataobj.searchStr.search_key+"%' OR (lower(u.first_name)) LIKE '%"+tagDataobj.searchStr.search_key.toLowerCase()+"%' OR u.email LIKE '%"+tagDataobj.searchStr.search_key+"%' )";
  }

  let orderBy = "ORDER BY u.id DESC ";
  if(tagDataobj.orderStr){
     switch(tagDataobj.orderStr.column) {
        case '0':
            orderBy = "ORDER BY u.username "+tagDataobj.orderStr.dir;
            break;
        case '1':
            orderBy = "ORDER BY u.email "+tagDataobj.orderStr.dir;
            break;
        case '3':
            orderBy = "ORDER BY u.status "+tagDataobj.orderStr.dir;
            break;
        case '4':
            orderBy = "ORDER BY u.created_at "+tagDataobj.orderStr.dir;
            break;
        default: 
            orderBy = "ORDER BY u.username DESC";
    }
  }

  let sqlTotalDisplayQuery = "SELECT COUNT(u.id) AS searchNumRows FROM gos_users u WHERE  "+where;

  let sqlQuery = "SELECT u.* FROM gos_users u WHERE  "+where+" "+orderBy+" "+limit;

  //console.log(sqlQuery);

  const promiseUser = new Promise((resolve, reject) => {

    sql.query("SELECT COUNT(id) AS numRows FROM gos_users u where "+where+"",async function (err, rows)  {
      if (err) {
        //console.log("error: ", err);
        result(err, null);
        return;
      }
      if (await rows.length && rows[0].numRows>0) {
          var iTotalRecords = rows[0].numRows;
          sql.query(sqlTotalDisplayQuery,async function (err, searchrows)  {
              if (err) {
                //console.log("error: ", err);
                result(err, null);
                return;
              }
              if (await searchrows.length && searchrows[0].searchNumRows>0) {
                  var iTotalDisplayRecords = searchrows[0].searchNumRows;
                  sql.query(sqlQuery,async function (err, res)  {
                        if(err) {
                            console.log("error: ", err);
                            result(err, null);
                        }else{
                        for (var i = 0; i < res.length; i++) 
                          {
                            let statusTxt = res[i].status ==1 ? 'Active' : 'Deactive';
                            let actionTxt = res[i].status ==1 ? 'Deactivate' : 'Activate';
                            let checkedTxt = res[i].status==1 ? 'checked' : '' ;
                            let valueTxt = res[i].status==1 ? 0 : 1 ;

                            let action = '';
                            action +='<form method="POST" action="/admin/users/change_user_status"><input type="hidden" name="id" value="'+res[i].id+'"><label class="switch mr-1"  title="'+actionTxt+' user"><input type="checkbox" name="status" class="userStatus" '+checkedTxt+' onclick="return confirm(\'Are you sure you want to '+actionTxt+' this user?\');" onChange="this.form.submit()" value="'+valueTxt+'"><span class="slider round"></span></label></form>';

                            action +='<a href="/admin/users/add/'+res[i].id+'" title="Edit"><i class="fas fa-edit mr-1"></i></a>';
                            action +='<a href="/admin/users/'+res[i].id+'?_method=DELETE" class="delete" onclick="return confirm(\'Are you sure you want to delete this user?\');" title="Delete"><i class="fas fa-trash"></i></a>';

                            dataArr.push({  
                                            'username' : res[i].username,
                                            'email' : res[i].email,
                                            'status' : statusTxt,
                                            'created_at' : moment(res[i].created_at).tz(tzone).format('YYYY-MM-DD HH:mm:ss'),
                                            'action' : action
                                        });

                              if((i+1)==res.length){

                                let returnData = {
                                  iTotalRecords:iTotalRecords,
                                  iTotalDisplayRecords:iTotalDisplayRecords,
                                  dataArr:dataArr
                                }
                                setTimeout(resolve, 100, returnData);
                              }
                            }
                        }
                  });
              }
              else{
                   let returnData = {
                                iTotalRecords:iTotalRecords,
                                iTotalDisplayRecords:0,
                                dataArr:dataArr
                              }
                   setTimeout(resolve, 100, returnData);
              }
          });  
      }
      else{
           let returnData = {
                        iTotalRecords:iTotalRecords,
                        iTotalDisplayRecords:iTotalDisplayRecords,
                        dataArr:dataArr
                      }
           setTimeout(resolve, 100, returnData);
      }
    });
  });

  Promise.all([promiseUser]).then((values) => {
    //console.log(values[0].dataArr);
    var response = {
          "draw" : tagDataobj.draw,
          "iTotalRecords" : values[0].iTotalRecords,
          "iTotalDisplayRecords" : values[0].iTotalDisplayRecords,
          "aaData" : values[0].dataArr
      };
      return result(null , response);
  });
};

// get selected options based on user id
User.getOptionIdsByUserID = (userId, result) => {
	sql.query("SELECT u.*, GROUP_CONCAT(DISTINCT sopt.option_id) AS optionIds FROM `gos_users` AS u LEFT JOIN `gos_120_growth_users_score_option` AS sopt ON u.id = sopt.user_id WHERE u.id = '"+ userId+"'", (err, res) => {
		if (err) {
			//console.log("error: ", err);
			result(err, null);
			return;
		}
	  
		if (res.length) {
			//console.log("found : ", res[0]);
			result(null, res[0]);
			return;
		}
	  
		// not found
		result(null, { kind: "not_found" });
	})
}

module.exports = User;