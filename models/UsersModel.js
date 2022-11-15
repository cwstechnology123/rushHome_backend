
const sql = require("../config/db_connection.js");
const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');


const logger = new Logger();
const errHandler = new RequestHandler(logger);

// constructor
const Users = function(options) {
  this.limit = 20;
  this.options = options;
}

//Generate a username for user
Users.generateUsername = (first_name) => {
	let ustr = first_name.trim();
	return ustr + '_' + Math.floor(Math.random() * (999 - 1) + 1);
};

Users.updateUserObj = (currentObj, newObj) => {
	for (const item in currentObj) {
	  if(newObj[item]) {
	  	currentObj[item] = newObj[item];
	  }
	}
	return currentObj;
};

//Create a new user
Users.create = (newUser, result) => {
  sql.query("INSERT INTO gos_users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId });
    newUser.id = res.insertId;

    result(null, { result: 'success', userinfo: newUser });
  });
};

//Find by custom options
Users.getByCustomOptions = (options, result) => {
  sql.query("SELECT * FROM gos_users u "+options, (err, res) => {
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
    result(null, { kind: "not_found" });
  });
};

//Update a user object
Users.updateById = (id, user, result) => {
  sql.query(
    "UPDATE gos_users SET ? WHERE id = ?",
    [user, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      //console.log("updated user: ", { id: id });
      result(null, { result: 'success', userinfo: user });
    }
  );
};

//Find a user by id
Users.findById = (userId, result) => {
  sql.query("SELECT * FROM gos_users u WHERE u.id = '"+ userId+"'", (err, res) => {
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

Users.getAll = result => {
  sql.query("SELECT * FROM gos_users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    //console.log("users: ", res);
    result(null, res);
  });
};

Users.remove = (id, result) => {
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

Users.removeAll = result => {
  sql.query("DELETE FROM gos_users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

//Find a verify otp by id,otp
Users.verifyOtp = (userId,otp,result) => {

  sql.query('SELECT id,otp FROM gos_users WHERE id = "'+userId+'" AND otp="'+otp+'"', (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      //console.log("found user: ", res[0]);
      result(null, { result: 'success', message: 'CODE Verified!' });
      return;
    }

    // not found Customer with the id
    result(null, { result: 'failure', message: 'CODE Invalid!' });
  });
};

Users.updateOtp = (id, new_otp, result) => {
  sql.query(
    "UPDATE gos_users SET otp=? WHERE id = ?",
    [new_otp, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("updated otp: ", { id: id });
      result(null, { result: 'success', otp: new_otp });
    }
  );
}

//check email verification code by id
Users.checkEmailVerificationCode = (id, result) => {
  sql.query("SELECT otp FROM gos_users WHERE id = '" + id + "'", (err, res) => {
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

    // not found user with the id
    result(null, { kind: "not_found" });
  });
};

Users.getUsers = (page,numPerPage,result) => {

  var skip = (page-1) * numPerPage;
  var limit = "  LIMIT  "+skip + ',' + numPerPage;
  console.log(limit);

  let sqlQuery = "SELECT * from gos_users "+limit;

  //console.log(sqlQuery);
  sql.query("SELECT COUNT(u.id) AS numRows FROM gos_users u",async function (err, rows)  {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (await rows.length && rows[0].numRows>0) {
        var numRows = rows[0].numRows;
        var numPages = Math.ceil(numRows / numPerPage);
        await sql.query(sqlQuery,await function (err, res)  {
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }else{
                //console.log(res);
                //console.log("found user: ", res[0]);
                  if ((page-1) < numPages) {
                    pagination = {
                      total:numRows,
                      current: page,
                      perPage: numPerPage,
                      previous: page > 1 ? page - 1 : undefined,
                      next: (page-1) < numPages - 1 ? page + 1 : undefined
                    }
                  }
                  else {
                    pagination = {
                    err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                  }
                }
                result(null, {list:res,pagination:pagination});
                return;
            }
        });     
    }
    else{
          // not found Customer with the id
          result(null, { kind: "not_found" });
          return;
    }

  });
};

Users.changeUserStatus = (id, status, result) => {
  sql.query(
    "UPDATE gos_users SET status=? WHERE id = ?",
    [status, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("updated status: ", { id: id });
      result(null, { result: 'success', status: status });
    }
  );
}

module.exports = Users;