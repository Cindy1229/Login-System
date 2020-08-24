const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {promisify}=require('util')

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE

})

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).render('login', { message: 'Please provide email or password!' })
        }

        db.query('SELECT * FROM users WHERE email=?', [email], async (error, results) => {
            console.log(results)
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', { message: 'Wrong password or email!' })
            }
            else {
                const id = results[0].id
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRE_IN
                })

                console.log('the token is', token)
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,

                }

                res.cookie('jwt', token, cookieOptions)
                res.status(200).redirect('/')
            }
        })
    }
    catch (error) {
        console.log(error)
    }
}

exports.register = (req, res) => {

    const { name, email, password, passwordConfirm } = req.body

    db.query('SELECT email FROM users WHERE email=?', [email], async (error, results) => {
        if (error) {
            console.log(error)
        }
        else {
            if (results.length > 0) {
                return res.render('register', {
                    message: 'Email is already in use'
                })
            }
            else if (password !== passwordConfirm) {
                return res.render('register', {
                    message: 'passwords do not match'
                })
            }

        }

        let hashedPassword = await bcrypt.hash(password, 8)
        console.log(hashedPassword)

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error)
            }
            else {
                console.log(results)
                return res.render('register', {
                    message: 'User registered!'
                })
            }
        })
    })

}

exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies)

    if(req.cookies.jwt){
        try{
            //verify the token
            const decoded=await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            console.log(decoded)

            //Check if the user still exists
            db.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, results)=>{
                if(!results) {
                    return next()
                }
                //console.log(results[0]);

                req.user=results[0]
                return next()
            })

        }
        catch(error){
            console.log(error)
            return next()
        }
    }
    else {
        next()
    }

}

exports.logout=async (req, res)=>{
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2000),
        httpOnly: true
    })

    res.status(200).redirect('/')

}