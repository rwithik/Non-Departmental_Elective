const express = require('express')
const router = express.Router()
const models = require('../../models')
const methods = require('../../methods')
const importExcel = require('convert-excel-to-json')

router.get('/dashboard', (req, res, next) => {
  methods.HOD.getHODs().then(function (result) {
    var dic = { "HOD": result }
    let hod = []
    for (let i = 0; i < dic["HOD"].length; i += 1) {
      hod.push(dic["HOD"][i].dataValues);
    }
    let hoddept = []
    for (let i = 0; i < hod.length; i++) {
      hoddept.push(hod[i].deptID)
    }
    methods.department.getDepts(hoddept).then(function (result) {
      var dict = { "data": result }
      let depts = [];
      for (let i = 0; i < dict["data"].length; i += 1) {
        depts.push(dict["data"][i].dataValues);
      }
      methods.course.getCourses()
        .then(re => {
          methods.department.getAllDepts()
            .then(dep => {
              res.render('admindashboard', { "HOD": hod, "data": depts, title: 'Admin Dashboard', dept: dep, course: re });
            })
            .catch(e => {
              console.log(e);
            })
        })
        .catch(er => {
          console.log(er)
        })
    }).catch(function (err) {
      res.json({
        "success": false,
        "data": err
      })
    })
  })
})

router.post("/addHOD", (req, res) => {
  methods.authentication.registerHOD(req.body)
    .then(result => {
      methods.HOD.addHOD(req.body)
        .then(re => {
          res.redirect("/admin/dashboard")
        })
    })
})

router.post('/changePassword', (req, res, next) => {
  methods.user.changePasswordHOD(req.body.userID, req.body.password)
    .then(re => {
      res.redirect('/admin/dashboard') //Make redirection to another page saying password change successful
    })
    .catch(er => {
      res.send({ success: false, error: er })
    })
})

router.get("/allot", (req, response) => {
  methods.result.clearResult()
    .then(result => {
      methods.course.unfill()
        .then(re => {
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
                      for (var z = 0; z < allotment.length; z++) {
                        methods.result.addResult(allotment[z])
                      }
                      methods.course.getCourses()
                        .then(result => {
                          var dic = { "course": result }
                          let course = []
                          for (let i = 0; i < dic["course"].length; i += 1) {
                            course.push(dic["course"][i].dataValues);
                          }
                          let cid = []
                          for (let i = 0; i < course.length; i++) {
                            cid.push(course[i].courseID)
                          }
                          for (let k = 0; k < cid.length; k++) {
                            methods.result.getResultCourse(cid[k])
                              .then(re2 => {
                                methods.course.fill(cid[k], re2.length)
                                  .then(re => {
                                    console.log("fill");
                                  })
                              })
                          }
                        })
                      response.redirect("/admin/dashboard")
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
    })
})

router.get("/courses", (req, res) => {
  methods.course.getCourses()
    .then(re => {
      res.render('course', { title: 'courses', result: re })
    })
})

router.get("/back", (req, res) => {
  res.redirect("/admin/dashboard")
})

router.post("/upload", (req, res) => {
  let file = req.files.myFile;
  let filename = file.name;
  let details = [];
  file.mv('./excel/' + filename, (err) => {
    if (err) {
      console.log(err)
    }
    else {
      let result = importExcel({
        sourceFile: './excel/' + filename,
        header: { rows: 1 },
        columnToKey: { A: 'RegID', B: 'Name', E: 'email', G: 'cgpa', H: 'Dept' },
        sheets: ['Sheet1']
      });
      for (var i = 0; i < result.Sheet1.length; i++) {
        methods.student.addStudent(result.Sheet1[i], result.Sheet1[i].Dept);
      }
    }
  })
  res.redirect("/admin/dashboard")
})

router.post("/result", (req, res) => {
  var dept = req.body.deptID
  var course = req.body.courseID
  if (dept == "none" && course == "none") {
    methods.result.getResults()
      .then(re => {
        methods.course.getCourses()
          .then(crs => {
            methods.student.getAllStudents()
              .then(stud => {
                res.render('result', { result: re, course: crs, student: stud })
              })

          })
      })
  }
  else if (dept == "none") {
    methods.result.getResults()
      .then(re => {
        methods.course.getCourse(course)
          .then(crs => {
            methods.student.getAllStudents()
              .then(stud => {
                res.render('result', { result: re, course: crs, student: stud })
              })
          })
      })
  }
  else if (course == "none") {
    methods.result.getResults()
      .then(re => {
        methods.course.getCourses()
          .then(crs => {
            methods.student.getAllStudentsDept(dept)
              .then(stud => {
                res.render('result', { result: re, course: crs, student: stud })
              })
          })
      })
  }
  else {
    methods.result.getResults()
      .then(re => {
        methods.course.getCourse(course)
          .then(crs => {
            methods.student.getAllStudentsDept(dept)
              .then(stud => {
                res.render('result', { result: re, course: crs, student: stud })
              })

          })
      })
  }
})

module.exports = router;