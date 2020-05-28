const express = require('express');
const router = express.Router();
const auth= require('../../middleware/auth');

const Profile = require('../../models/Profile');//bring profile model
const User = require('../../models/User');//user model also needed


// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me',auth, async (req,res) => {
  try{
    const profile=await Profile.findOne({user:req.user.id}).populate('user',
    ['name', 'avatar']);

    if(!profile){
      return res.status(400).json({msg:'There is no profile of this user'});
    }


  }catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
});

module.exports= router;
