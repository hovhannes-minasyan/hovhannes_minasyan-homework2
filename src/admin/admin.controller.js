const express = require('express');
const router = express.Router();
const users = require('../users/users.service');
const asyncHandler = require('express-async-handler');
const Role = require("../commons/util").Role;

router.use(function(req,res, next){
    if(req?.user?.role !== Role.Admin){
        return next(new Forbidden())
    }
    return next();
});

router.use(function timeLog (req, res, next) {
    console.log('Time: ', new Date());
    next();
})

router.patch('/unlock-user/:id/', asyncHandler(async (req, res) => {
    const {id} = req.params;
    await users.update(id, {isLocked:false});
    
    res.status(200).send({message:"User has successfully been unlocked!"});
}))

router.patch('/lock-user/:id/', asyncHandler(async (req, res) => {
    const {id} = req.params;
    await users.update(id, {isLocked:true});
    
    res.status(200).send({message :"User has successfully been locked!"});
}))

module.exports = router;