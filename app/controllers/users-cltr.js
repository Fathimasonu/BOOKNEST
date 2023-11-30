const User = require('../models/user-model') 
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const bcryptjs = require('bcryptjs')
const _ = require('lodash')
const usersCltr = {} 

usersCltr.register = async (req, res) => {
    const errors = validationResult(req) 
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = _.pick(req.body, ['username','email','password'])
    console.log(body);
    try {
        const user = new User(body) 
        //console.log(user);
        const salt = await bcryptjs.genSalt() 
        //console.log(salt);
        const hashedPassword  = await bcryptjs.hash(user.password, salt) 
        //console.log(hashedPassword);
        user.password = hashedPassword
        const finalUser=await user.save()
        
        res.json(finalUser)
        console.log(user);
    } catch(e) {
        res.status(400).json(e) 
    }
}

usersCltr.login = async (req, res) => {
    const errors = validationResult(req) 
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = _.pick(req.body, ['email', 'password']) 
    try {
        const user = await User.findOne({ email: body.email })
        if(!user) {
            return res.status(404).json({ errors: [{msg:'invalid email or password'}]})
        }  

        const result = await bcryptjs.compare(body.password, user.password)
        if(!result) {
            return res.status(404).json({ errors:[{msg:'invalid email or password'}]  }) 
        }
        
        const tokenData = { id: user._id }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d'})
        res.json({ token: `Bearer ${token}`})
    } catch(e) {
        res.status(500).json(e)
    }
}

usersCltr.account = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.json(user)
    } catch(e) {
        res.status(500).json({ errors: 'something went wrong'})
    }
}


module.exports = usersCltr 