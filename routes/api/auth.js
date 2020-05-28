const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');//check documentation of express validator

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test router
// @access  Public
router.get('/',auth, async (req,res) => {
  try{
    const user=await User.findById(req.user.id).select('-password');//gets everything except password
    res.json(user);
  }catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/',[
  //here name is not needed as this is for login not registeration
  check('email','Please include a valid email').isEmail(),
  check('password','Password is required').exists()
],
async (req,res) => {
  //console.log(req.body);
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array() });
  }

const {email,password}=req.body;



try{
  //See if user exist
  let user=await User.findOne({email:email});//chk//we use await because of async...makes it easy
  if(!user){
    return res
     .status(400)
     .json({errors:[{msg:'Invalid Credentials'}]});
  }


  //check email pass entered matches the user email and pass(using bcrypt)

  const isMatch=await bcrypt.compare(password,user.password);

  if(!isMatch){
    return res
     .status(400)
     .json({errors:[{msg:'Invalid Credentials'}]});
  }


   const payload={
     user:{
       id:user.id//no need of _id ....id will work fine
     }
   }

   jwt.sign(
     payload,
     config.get('jwtSecret'),
     {expiresIn: 360000},
     (err,token) => {
       if(err) throw err;
       res.json({token});
     });

}catch(err){
  console.log(err.message);
  res.status(500).send('Server error');
}



}
);

module.exports= router;
