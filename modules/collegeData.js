const fs = require("fs");
const Sequelize = require('sequelize');

const sequelize = new Sequelize('xwiwczkh', 'xwiwczkh', 'jYYedqyjBmX8aQ3sHT1IgD1sRmZET5Mn', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define your models
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define relationships
Course.hasMany(Student, { foreignKey: 'course' });

// Sync the models with the database and then call initialize
sequelize.sync().then(() => {
    module.exports.initialize();
});

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to sync the database");
            });
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                if (students.length === 0) {
                    reject("no results returned");
                    return;
                }
                resolve(students);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { course: course } })
            .then(students => {
                if (students.length === 0) {
                    reject("no results returned");
                    return;
                }
                resolve(students);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { studentNum: num } })
            .then(students => {
                if (students.length === 0) {
                    reject("no results returned");
                    return;
                }
                resolve(students[0]);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses.length === 0) {
                    reject("no results returned");
                    return;
                }
                resolve(courses);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({ where: { courseId: id } })
            .then(courses => {
                if (courses.length === 0) {
                    reject("no results returned");
                    return;
                }
                resolve(courses[0]);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
}

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        for (const prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create student");
            });
    });
}

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        for (const prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, { where: { studentNum: studentData.studentNum } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update student");
            });
    });
}
module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (const prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create course");
            });
    });
}

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (const prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        Course.update(courseData, { where: { courseId: courseData.courseId } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to update course");
            });
    });
}

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({ where: { courseId: id } })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to delete course");
            });
    });
}

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        })
        .then(affectedRows => {
            if (affectedRows > 0) {
                resolve();
            } else {
                reject("Student not found or not deleted");
            }
        })
        .catch(err => {
            reject("Unable to delete student");
        });
    });
}
