const express = require('express');
const router = express.Router();
const gravatar=require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');//check documentation of express validator

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',[
  check('name','Name is required')
     .not()
     .isEmpty(),
  check('email','Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({min:6})
],
async (req,res) => {
  //console.log(req.body);
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array() });
  }

const {name,email,password}=req.body;



try{
  //See if user exist
  let user=await User.findOne({email:email});//chk//we use await because of async...makes it easy
  if(user){
    return res.status(400).json({errors:[{msg:'User already exists'}]});
  }

  //get user's gravatar
  const avatar=gravatar.url(email,{
    s:'200',
    r:'pg',
    d:'mm'//gives default user icon
  })

  user=new User({//this just creates a new instance to save it first we encrypt password then user.save()
    name,
    email,
    avatar,
    password
  });


  //encrypt password
  const salt = await bcrypt.genSalt(10);

  user.password=await bcrypt.hash(password, salt);

  await user.save();//wherever there is a promise use await

  //return jsonwebtoken-->to get logged in right away when user registers in frontend

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
