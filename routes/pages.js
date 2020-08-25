const express=require('express')
const authController=require('../controllers/auth')

const router=express.Router()

router.get('/', authController.isLoggedIn, (req, res)=>{
    if(req.user){
        res.render('index', {
            user: req.user
        })
    }
    else {
        res.render('index')
    }
    
})

router.get('/register', (req, res)=>{
    res.render('register')
})

router.get('/login', (req, res)=>{
    console.log('query is', req.query.success)
    if(req.query.success){
        res.render('login', {
            success: 'Registration Success! Please Login'
        })
    }
    else {
        res.render('login')
    }
    
})

router.get('/profile', authController.isLoggedIn, (req, res)=>{

    //console.log(req.user);
    if(req.user){
        res.render('profile', {
            user: req.user

        })
    }
    else {
        res.redirect('/login')
    }
})

module.exports=router