const Promise = require('bluebird');

const models = require('../../models');
// const obtainInformation = require('./obtainInformation');
const Sequelize = require('sequelize');
var { sequelize } = models;
// const methods = require('../../methods');
const methods = require('../../methods')
const Op = Sequelize.Op;

var allotmentMethods = {}

allotmentMethods.allot = function () {
  return new Promise((resolve, reject) => {
    methods.student.generateRankList()
      .then(res2 => {
        methods.student.getStudentPreferences(res2)
          .then(res => {
            methods.course.getAllCourses()
              .then(re => {
                var course_list = re;
                var allotment = []
                res.forEach(studObj => {
                  studentID = Object.keys(studObj)[0]
                  courses = studObj[studentID]
                  if (!courses) {
                    //student not specified preference
                    // Add such students to an array and finally allot them to any course that is not yet filled
                    //    Todo
                    console.log(studentID, "not specified any preference")
                  }
                  else {
                    for (var i = 0; i < courses.length; i++) {
                      var course = courses[i];
                      if (course_list[course][1] < course_list[course][0]) {
                        course_list[course][1]++;
                        var stud_allot = {}
                        stud_allot['studentID'] = studentID;
                        stud_allot['courseID'] = course;
                        allotment.push(stud_allot);
                        break;
                      }
                    }
                  }
                });

              })
              .catch(er => {
                console.log(er)
              })

          })
      })
      .catch(erro => {
        reject(erro)
      })

  })
}

allotmentMethods.bulkCreate = function (allotments) {
  return new Promise((resolve, reject) => {
    models.result.bulkCreate(allotments).then(() => {
      return models.result.findAll({
        raw: true
      });
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err);
    })
  })
}

module.exports = allotmentMethods