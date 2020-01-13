const Promise = require('bluebird');
const models = require('../../models');
// const obtainInformation = require('./obtainInformation');
const Sequelize = require('sequelize');
var { sequelize } = models;
const HODMethods = require('../../methods/HOD')
const departmentMethods = {};
const Op = Sequelize.Op;

departmentMethods.getDepts = (hoddept) => {
  return new Promise((resolve, reject) => {
    models.department.findAll({
      where: {
        Did: {
          [Op.notIn]: hoddept
        }
      },
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
departmentMethods.getAllDepts = () => {
  return new Promise((resolve, reject) => {
    models.department.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

departmentMethods.getReqDept = function (deptID) {
  return new Promise((resolve, reject) => {
    models.department.findOne({
      where: {
        Did: deptID
      }
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
/*departmentMethods.getCoursesElligibleForDept = function(deptID) {
  deptid = [];
  deptid[0] = deptID
  return new Promise((resolve,reject) => {
    models.Course.findAll({
      raw : true,
      where : {
        deptID : {
          [Op.notIn]: deptid
        }   
      },
      attributes : ['id','name','courseID','name']
    })
    .then(res => {
      resolve(res)
    })
    .catch(err => {
      reject(err)
    })
  })
}*/

module.exports = departmentMethods;