const express = require('express');
const router = express.Router();
const mysql = require('mysql2');


require('dotenv').config();

conn = mysql.createPool({
    host: process.env.DB_HOST_,
    user:  process.env.DB_USER_,
    password: process.env.DB_PASS_,
    database: process.env.DB_NAME_,
    waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
 });
 
 // conn.connect((err) => {
 //     if (err) throw err;
 //     console.log('Connected');
 // });

router.get('/', (req, res) => {
    if (req.session.email) {
        sql = 'SELECT * FROM urls WHERE user_id = ?';
        conn.query(sql, [req.session.user_id], (err, result) => {
            if (err) throw err;
            // console.log(process.env.BASE_URL);
            res.render('myurls', {
                title: 'My URLs',
                session: req.session,
                urls: result,
                base: process.env.BASE_URL
            });
        }); 
    } else {
        res.render('index', {
            title: 'Home Page'
        });
    }
});

router.post('/create', (req, res) => {
    if (req.body.longurl !== '' && req.body.backhalf !== '') {
        sql = 'SELECT * FROM urls WHERE back_half = ?';
        conn.query(sql, [req.body.backhalf], (err, result) => {
            if (result.length) {
                res.render('myurls', {
                    title: 'My URLs',
                    session: req.session,
                    error: 'The back half you entered is already taken, Please try again.'
                });
            } else {
                sql = "INSERT INTO urls (title, back_half, long_url, user_id) VALUES (?, ?, ?, ?)";
                conn.query(sql, [req.body.title, req.body.backhalf, req.body.longurl, req.session.user_id], (err, result) => {
                    if (err) {
                        res.render('myurls', {
                            title: 'My URLs',
                            session: req.session,
                            error: 'Unable to create URL.'
                        });
                        // throw err;
                    } else {
                        sql = 'SELECT * FROM urls WHERE user_id = ?';
                        conn.query(sql, [req.session.user_id], (err, result) => {
                            if (err) throw err;
                            // console.log(result)
                            res.render('myurls', {
                                title: 'My URLs',
                                session: req.session,
                                urls: result,
                                base: process.env.BASE_URL
                            });
                        }); 
                    }
                })
                    }
                });
            } else {
                res.render('myurls', {
                    title: 'My URLs',
                    session: req.session,
                    error: 'Long URL and Back half fields are required.'
                });
            }
});

module.exports = router;