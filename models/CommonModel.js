const sql = require("../config/db_connection.js");

// constructor
const CommonModel = function(data) {
 
};

/**
 * 
 * getByUserID:
 */
CommonModel.getByUserID = (userId, tableNm='', result) => {
 if(tableNm == '' || tableNm == undefined){
    result({result : 'error', message : 'Table name is missing.'}, null);
    return false;
 }
  sql.query("SELECT * FROM "+tableNm+" WHERE user_id = '"+userId+"'", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      //console.log("found result: ", res[0]);
      result(null, res);
      return;
    }

    // not found with the id
    result(null, { kind: "not_found" });
  });
};

//Find by user id
CommonModel.findByUserId = (userId, tableNm='', result) => {
    if(tableNm == '' || tableNm == undefined){
        result({result : 'error', message : 'Table name is missing.'}, null);
        return false;
     }
	sql.query("SELECT * FROM "+tableNm+" WHERE user_id = '"+ userId+"'", (err, res) => {
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

//Update a object
CommonModel.updateByUserId = (userId, tableNm='', updateData, result) => {
    if(tableNm == '' || tableNm == undefined){
        result({result : 'error', message : 'Table name is missing.'}, null);
        return false;
     }
	sql.query(
	  "UPDATE "+tableNm+" SET ? WHERE user_id = ?",
	  [updateData, userId],
	  (err, res) => {
		if (err) {
		  console.log("error: ", err);
		  result(err, null);
		  return;
		}
  
		//console.log("updated");
		result(null, { result: 'success', updateData: updateData });
	  }
	);
};

//Create a new record by userId
CommonModel.create = (newData, tableNm='', result) => {
    if(tableNm == '' || tableNm == undefined){
        result({result : 'error', message : 'Table name is missing.'}, null);
        return false;
     }
	sql.query("INSERT INTO "+tableNm+" SET ?", newData, (err, res) => {
	  if (err) {
		console.log("error: ", err);
		result(err, null);
		return;
	  }
  
	  console.log("created data: ", { id: res.insertId });
	  newData.id = res.insertId;
  
	  result(null, { result: 'success', createdData : newData });
	});
};

module.exports = CommonModel;