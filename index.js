const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const session = require('express-session');
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
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Session Middleware
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);


// Routes
app.use('/users', require('./routes/users'));
app.use('/app', require('./routes/app'));

app.get('/', (req, res) => res.render('index', {
    title: 'Home Page',
    session: req.session
}));

app.get('/:slug', (req, res) => {
    sql = 'SELECT * FROM urls WHERE back_half = ?';
    conn.query(sql, [req.params.slug], (err, result) => {
        if (err) throw err;
        if (result.length) {
            res.redirect(result[0].long_url);
        }
    })
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running at port ${PORT}`))