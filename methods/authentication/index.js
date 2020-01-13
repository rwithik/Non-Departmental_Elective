const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const models = require("../../models");
const Promise = require("bluebird");
const key = require("../../config/api.json").API_SECRET;
const { sequelize } = require("../../models");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const config = require('../../config/config.json');

var authenticationMethods = {};
const options = {
  digits: true,
  alphabets: false,
  upperCase: false,
  specialChars: false
}
let state = true;

authenticationMethods.registerAdmin = function (info) {
  return new Promise(function (resolve, reject) {
    bcrypt
      .hash(info.password, saltRounds)
      .then(hash => {
        return sequelize
          .transaction(function (t) {
            var user = {};
            user.username = info.username;
            user.password = hash;
            user.type = 1;
            return models.user
              .create(user, { transaction: t })
              .then(function (user) {
              })
              .catch(function (err) {
                reject({ success: err });
              });
          })
          .then(function (result) {
            resolve({ success: true });
          })
          .catch(function (err) {
            reject({ success: "false3" });
          });
      })
      .catch(err => {
        reject({ success: "false4" });
      });
  });
};

authenticationMethods.registerHOD = function (info) {
  return new Promise(function (resolve, reject) {
    bcrypt
      .hash(info.password, saltRounds)
      .then(hash => {
        return sequelize
          .transaction(function (t) {
            var user = {};
            user.username = info.username;
            user.password = hash;
            user.type = 2;
            return models.user
              .create(user, { transaction: t })
              .then(function (user) {
              })
              .catch(function (err) {
                reject({ success: err });
              });
          })
          .then(function (result) {
            resolve({ success: true });
          })
          .catch(function (err) {
            reject({ success: "false3" });
          });
      })
      .catch(err => {
        reject({ success: "false4" });
      });
  });
};

authenticationMethods.registerAdvisor = function (info) {
  return new Promise(function (resolve, reject) {
    bcrypt
      .hash(info.password, saltRounds)
      .then(hash => {
        return sequelize
          .transaction(function (t) {
            var user = {};
            user.username = info.username;
            user.password = hash;
            user.type = 3;
            return models.user
              .create(user, { transaction: t })
              .then(function (user) {
              })
              .catch(function (err) {
                reject({ success: err });
              });
          })
          .then(function (result) {
            resolve({ success: true });
          })
          .catch(function (err) {
            reject({ success: "false3" });
          });
      })
      .catch(err => {
        reject({ success: "false4" });
      });
  });
};

authenticationMethods.authenticateUser = function (username, password) {
  return new Promise(function (resolve, reject) {
    models.user
      .findOne({
        where: {
          username: username
        }
      })
      .then(result => {
        if (result) {
          bcrypt.compare(password, result.password, function (err, res) {
            if (res === true) {
              const token = jwt.sign(
                {
                  id: result.username,
                  type: result.dataValues.type
                },
                key,
                { expiresIn: "1h" }
              );
              const type = result.dataValues.type;
              const user_id = result.dataValues.username;
              var decoded = jwt.decode(token, { complete: true });

              resolve({
                success: true,
                token: token,
                type: type,
                user_id: user_id
              });
            } else {

              reject({ success: false, token: null });
            }
          });
        } else {
          reject(new Error());
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

state = true;

authenticationMethods.authenticateStudent = function (username) {
  return new Promise(function (resolve, reject) {
    models.student
      .findOne({
        where: {
          id: username
        }
      })
      .then(result => {
        if (result) {
          const emailid = result.dataValues.email;
          console.log(result.dataValues.email);
          const otptoken = otpGenerator.generate(6, options);
          console.log(otptoken);
          var transporter1 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: "globalelective1@gmail.com",
              pass: "K36fCnspsU6MRPJ"
            }
          });
          var transporter2 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: "globalelective3@gmail.com",
              pass: "K36fCnspsU6MRPJ"
            }
          });
          var mailOptions = {
            from: 'globalelective@gmail.com',
            to: emailid,
            subject: "OTP",
            // text: `Your one time password is ${otptoken}`
            html: `<p>Your One-Time Password is <b>${otptoken}</b></p>`
          };
          // state = await setstate();
          state = !state;
          if (state) {
            transporter1.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              }
              else {
                console.log('Email sent: ' + info.response);
              }
            })
          }
          else {
            transporter2.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              }
              else {
                console.log('Email sent: ' + info.response);
              }
            })
          }
          resolve({
            success: true,
            token: otptoken,
          });
        } else {
          reject(new Error());
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

authenticationMethods.authenticateStud = function (username) {
  return new Promise(function (resolve, reject) {
    models.student
      .findOne({
        where: {
          id: username
        }
      })
      .then(result => {
        if (result) {
          const token = jwt.sign(
            {
              id: result.id,
              type: "student"
            },
            key,
            { expiresIn: "1h" }
          );
          const type = "student";
          const user_id = result.dataValues.id;
          var decoded = jwt.decode(token, { complete: true });

          resolve({
            success: true,
            token: token,
            type: type,
            user_id: user_id
          });
        } else {
          reject(new Error());
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

// authenticationMethods.authenticateOtp = function(username, token) {
//   return new Promise(function(resolve, reject) {
//     models.student
//       .findOne({
//         where: {
//           id: username
//         }
//       })
//       .then(result => {
//         if (result) {
//           console.log(result);
//           const emailid = result.dataValues.email;
//           // console.log(result.dataValues.email);
//           if(result.dataValues.verified === 0){
//             const otptoken = otpGenerator.generate(6, options);
//             // console.log(otptoken);
//             var transporter = nodemailer.createTransport({
//               service: 'gmail',
//               auth: {
//                 user: 'justinebiju05@gmail.com',
//                 pass: 'Sandia06'
//               }
//             });
//             var mailOptions = {
//               from: 'justinebiju05@gmail.com',
//               to: emailid,
//               subject: "OTP",
//               // text: `Your one time password is ${otptoken}`
//               html: `<p size=15>Your One-Time Password is <b>${otptoken}</b></p>`
//             }
//             transporter.sendMail(mailOptions, function(error, info){
//               if(error){
//                 console.log(error);
//               }
//               else {
//                 console.log('Email sent: ' + info.response);
//               }
//             })
//             resolve({
//                 success: true,
//                 token: otptoken,
//               });
//           }
//         } else {
//           reject(new Error());
//         }
//       })
//       .catch(err => {
//         reject(err);
//       });
//   });
// };

module.exports = authenticationMethods;
