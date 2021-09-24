const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();

conn = mysql.createConnection({
   host: process.env.DB_HOST_,
   user:  process.env.DB_USER_,
   password: process.env.DB_PASS_,
   database: process.env.DB_NAME_
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Connected');
});

// Registration
router.get('/register', (req, res) => res.render('register', {
    title: 'Register'
}));

router.post('/register', (req, res) => {
    if (req.body.password == req.body.cpassword) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
                conn.query(sql, [req.body.name, req.body.email, hash], (err, result) => {
                    if (err) {
                        res.render('register', {
                                title: 'Register',
                                error: 'Unable to register user.'
                        });
                        throw err;
                    } else {
                        console.log(result);
                        req.session.user_id = result.insertId;
                        req.session.username = req.body.name;
                        req.session.email = req.body.email;
                        res.redirect('/users/login');
                    }
                });
            });
        });
    } else {
        res.render('register', {
            title: 'Register',
            error: 'Passwords don\'t match!'
    });
    }
});

// Authentication
router.get('/login', (req, res) => res.render('login', {
    title: 'Login'
}));

router.post('/login', (req, res) => {
    sql = 'SELECT * FROM users WHERE email=?';
    conn.query(sql, [req.body.email], (err, result) => {
        if (err) {
            res.render('login', {
                    title: 'Login',
                    error: 'User does not exist'
            });
        } else {
            bcrypt.compare(req.body.password, result[0].password, (err, resp) => {
                if (resp == true) {
                    req.session.user_id = result[0].id;
                    req.session.username = result[0].name;
                    req.session.email = result[0].email;
                    res.redirect('/app');
                } else {
                    res.render('login', {
                        title: 'Login',
                        error: 'Incorrect Password'
                    });
                }
            });
        }
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(function(err) {
        // cannot access session here
        if (err) throw err;
        res.redirect('/')
    })
});

module.exports = router;