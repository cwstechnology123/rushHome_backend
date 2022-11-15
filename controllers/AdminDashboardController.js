const Dashboard = require("../models/AdminDashboardModel");

exports.countAllStats = function(req, res) {
  Dashboard.countAllUser(function(err, users) {
    console.log('method1')
    if (err)
    res.send(err);
    console.log('res', users);
    let resultData = {
        'total_users':users[0].total_users ? users[0].total_users : 0
    } ;
    console.log(resultData);
    res.render('dashboard', { title: 'Dashboard', data : resultData });
  });
};