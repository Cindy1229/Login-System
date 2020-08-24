const dotenv=require('dotenv')
const path=require('path')
const cookieParser=require('cookie-parser')

const express=require('express')
const app =express()


dotenv.config({path:'./.env'})

//set public dir
const publicDirectory=path.join(__dirname, './public')
app.use(express.static(publicDirectory))
//for form submit
app.use(express.urlencoded({extended:false}))
//for req body as json
app.use(express.json())
//enable cookie
app.use(cookieParser())
//set view engine
app.set('view engine', 'hbs')

//connect to mysql db
const mysql=require('mysql')
const db=mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE

})

db.connect((err)=>{
    if(err) {
        console.log(err)
    }
    else {
        console.log('mysql connected')
    }
})

//define routes
app.use('/', require('./routes/pages'))

app.use('/auth', require('./routes/auth'))

app.listen(3000, ()=>{
    console.log('server is on 3000')
})
