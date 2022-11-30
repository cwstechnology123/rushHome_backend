const sql = require("../config/db_connection.js");

// constructor
const Dashboard = function(user) {
  this.email = user.email;
  this.first_name = user.first_name;
  this.user_type = 1;
};

Dashboard.countAllUser = result => {
  sql.query("SELECT IFNULL(count(u.id), 0) As total_users FROM rc_users u where u.user_type!=1 ORDER BY u.id DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    //console.log("users: ", res);
    result(null, res);
  });
};

module.exports = Dashboard;