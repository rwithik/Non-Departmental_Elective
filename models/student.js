'use strict';
module.exports = (sequelize, DataTypes) => {
  const student = sequelize.define('student', {
    id:{
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING
      },
    name: DataTypes.STRING,
    cgpa : DataTypes.REAL
  }, {});
  student.associate = function(models) {
    // associations can be defined here
  models.student.belongsTo(models.department,{foreignKey:'deptID'})
  models.student.belongsTo(models.user,{foreignKey:'id',targetKey:'username'})
  models.student.hasMany(models.choice,{ foreignKey: 'studentID' })
  models.student.hasMany(models.elective,{foreignKey: 'studentID'})
  student.hasOne(models.result,{foreignKey:'studentID'});
  };
  return student;
};