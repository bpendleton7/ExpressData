const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { query } = require('express');
mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://localhost/data', {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// });

mongoose.connect('mongodb+srv://user:pass@cluster0.zylfw.mongodb.net/users?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error'));
mdb.once('open', callback => {

});

/**
 * correct is the index of the correct answer
 * @typedef {{question: string, responses: string[], correct: number}} Question
 */

const scheme = {
    username: String,
    password: String,
    email: String,
    age: Number,
    questions: []
};

let userSchema = new mongoose.Schema(scheme);

let User = mongoose.model('users', userSchema);

exports.index = (req, res) => {
    let today = new Date();
    let date = `${today.getMonth()}-${today.getDate()}-${today.getFullYear()}     ${(today.getHours() + 24) % 12 || 12}:${today.getMinutes()}:${today.getSeconds()}`

    let displayDate = '';
    if (req.cookies.lastVisit) {
        displayDate = `Last Visited: ${req.cookies.lastVisit}`;
    } else {
        displayDate = `Welcome!`
    }

    res.cookie('lastVisit', date, { maxAge: 999999999999 });
    console.log(JSON.stringify(req.session.user));
    res.render('index', {
        title: 'Home',
        lastVisitedTime: displayDate,
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user
    });
}

// LOGIN page
exports.login = (req, res) => {
    res.render('login', {
        title: 'Login',
        icon_href: '/images/login.png',
        css_href: '/login.css'
    });
};

// Check user info against the database
exports.verifyLogin = async (req, res) => {

    let user = await User.findOne({ username: req.body.username });
    if (user == null) {
        res.redirect('/login');
        console.log(`*Username: "${req.body.username}" not found in database.*`);
    } else {
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword) {
            // once user and pass are verified then we create a session with any key:value pair we want, which we can check for later
            req.session.user = {
                isAuthenticated: true,
                username: user.username,
                questions: user.questions
            }
            console.log(`User: "${req.body.username}" was authenticated.`);
            //Once logged in redirect to this page
            res.redirect('/update');
        } else {
            res.redirect('/login');
            console.log(`*Failed to log in, user "${req.body.username}" entered the wrong password.`);
        }

    }
}

// CREATE page
exports.create = (req, res) => {
    res.render('create', {
        title: 'Create Account',
        icon_href: '/images/create.png',
        css_href: '/create.css',
        script_src: 'create.js',
        questions: [
            {
              "question": "Which of the following is the oldest of these computers by release date?",
              "answers": [
                "TRS-80",
                "Commodore 64",
                "ZX Spectrum",
                "Apple 3"
              ]
            },
            {
              "question": "Who became Prime Minister of the United Kingdom in July 2016?",
              "answers": [
                "Theresa May",
                "Boris Johnson",
                "David Cameron",
                "Tony Blair"
              ]
            },
            {
              "question": "Who created the \"Metal Gear\" Series?",
              "answers": [
                "Hideo Kojima",
                "Hiroshi Yamauchi",
                "Shigeru Miyamoto",
                "Gunpei Yokoi"
              ]
            }
          ]
    })
}
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.updateUser = async (req, res) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.pass, salt);
    let questionss = [];
    for(let i = 0; i < 3; i++) {
        let question = JSON.parse(req.body['obj-question'+i]);
        question.answer = req.body['question'+i];
        questionss.push(question);
    }
    console.log("usah: " + req.session.user.username);
    let userr = await User.findOne({ username: req.session.user.username });
    userr.username = req.body.name;
    userr.questions = questionss;
    userr.age = req.body.age;
    userr.email = req.body.email;
    userr.password = hash;
    userr.save();
    // User.updateOne({username: req.session.user.username}, {
    //     username: req.body.name,
    //     questions: questionss,
    //     age: req.body.age,
    //     email: req.body.email,
    //     password: hash
    // });
    res.redirect('/update')
}

//Update page
exports.update = (req, res) => {
    res.render('update', {
        title: 'Update',
        icon_href: '/images/update.png',
        css_href: '/update.css',
        questions: [
            {
              "question": "Which of the following is the oldest of these computers by release date?",
              "answers": [
                "TRS-80",
                "Commodore 64",
                "ZX Spectrum",
                "Apple 3"
              ]
            },
            {
              "question": "Who became Prime Minister of the United Kingdom in July 2016?",
              "answers": [
                "Theresa May",
                "Boris Johnson",
                "David Cameron",
                "Tony Blair"
              ]
            },
            {
              "question": "Who created the \"Metal Gear\" Series?",
              "answers": [
                "Hideo Kojima",
                "Hiroshi Yamauchi",
                "Shigeru Miyamoto",
                "Gunpei Yokoi"
              ]
            }
          ]
    });
};

// Creating user in the database
exports.createUser = async (req, res) => {
    let dbUser = await User.findOne({ username: req.body.username });
 
    if (dbUser == null) {

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        let questions = [];
        for(let i = 0; i < 3; i++) {
            let question = JSON.parse(req.body['obj-question'+i]);
            question.answer = req.body['question'+i];
            questions.push(question);
        }

        console.log(req.body);
        let user = new User({
            username: req.body.username,
            password: hash,
            email: req.body.email,
            age: req.body.age,
            questions: questions
        });
        user.save((err, user) => {
            if (err) return console.error(err);
            console.log(user.username + ' added');
        });
        res.redirect('/login');
    } else {
        res.render('create', {
            title: 'Create Account',
            icon_href: '/images/create.png',
            css_href: '/create.css',
            script_src: 'create.js',
            UsernameExists: `*Username: "${req.body.username}" already exists. Please choose a new username.*`
        });
        console.log(`*Username: "${req.body.username}" already exists.*`);
    }
};

// API Page
exports.api = (req, res) => {
    let questions = {
        "Which of the following is the oldest of these computers by release date?":{
           "TRS-80":0,
           "Commodore 64":0,
           "ZX Spectrum":0,
           "Apple 3":0
        },
        "Who became Prime Minister of the United Kingdom in July 2016?":{
           "Theresa May":0,
           "Boris Johnson":0,
           "David Cameron":0,
           "Tony Blair":0
        },
        "Who created the \"Metal Gear\" Series?":{
           "Hideo Kojima":0,
           "Hiroshi Yamauchi":0,
           "Shigeru Miyamoto":0,
           "Gunpei Yokoi":0
        }
     }
    let user = User.find({}, "questions").then(object => {
        console.log(object);
        object.forEach(questionsArray => {
            questionsArray.questions.forEach(answeredQuestion => {
                questions[`${answeredQuestion.question}`][`${answeredQuestion.answer}`] ++
            })
        })
        res.json(questions);
    })
    
    // res.render('api', {
    //     title: 'API',
    //     css_href: '/api.css'
    // });
};
exports.apiAU = (req,res) => {
    res.render('api', {
             title: 'API',
            css_href: '/api.css'
         });
}