const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});



app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});




app.get("/students/add", (req, res) => {
    data.getCourses().then((courses) => {
        res.render("addStudent", { courses: courses });
    }).catch((err) => {
        res.render("addStudent", { courses: [] });
    });
});

app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(() => {
        res.redirect("/students");
    });
});


app.get("/student/:studentNum", (req, res) => {
    // Initialize an empty object to store the values
    let viewData = {};

    // Get student data by student number
    data.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            if (studentData) {
                viewData.student = studentData; // Store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // Set student to null if none were returned
            }

            // Get all courses
            return data.getCourses();
        })
        .then((courseData) => {
            viewData.courses = courseData; // Store course data in the "viewData" object as "courses"

            // Loop through viewData.courses and mark the selected course
            if (viewData.student) {
                viewData.courses.forEach((course) => {
                    if (course.courseId === viewData.student.course) {
                        course.selected = true;
                    }
                });
            }

            // Render the "student" view with the combined data
            res.render("student", { viewData: viewData });
        })
        .catch((error) => {
            console.error("Error:", error);
            viewData.student = null;
            viewData.courses = [];
            res.status(500).send("Internal Server Error");
        });
});

app.get("/student/delete/:studentNum", (req, res) => {
    data.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch(() => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
    data.addCourse(req.body).then(() => {
        res.redirect("/courses");
    });
});

app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        res.render("courses", {courses: data});
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

app.post("/course/update", (req, res) => {
    data.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    });
});

app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        if (!data) {
            res.status(404).send("Course Not Found");
            return;
        }
        res.render("course", { course: data }); 
    }).catch((err) => {
        res.status(404).send("Course Not Found");
    });
});

app.get("/course/delete/:id", (req, res) => {
    data.deleteCourseById(req.params.id).then(() => {
        res.redirect("/courses");
    }).catch(() => {
        res.status(500).send("Unable to Remove Course / Course not found");
    });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

