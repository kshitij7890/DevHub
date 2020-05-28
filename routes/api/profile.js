const express = require('express');
const router = express.Router();
const auth= require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

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


// @route   POST api/profile
// @desc    Create user profile or update it
// @access  Private
router.post('/',[auth,[
  check('status','Status is required')
   .not()
   .isEmpty(),
  check('skills','Skills is required')
   .not()
   .isEmpty()
]
],
 async (req,res) => {
   const errors=validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({errors: errors.array()});
   }

   const {
       company,
       location,
       website,
       bio,
       skills,
       status,
       githubusername,
       youtube,
       twitter,
       instagram,
       linkedin,
       facebook
     } = req.body;//pull everything out of body


   //Build profile object
   const profileFields={};//obj created to insert into database ... we need to check if stuff actually coming in before we set it
   profileFields.user=req.user.id;
   if(company) profileFields.company = company;
   if (website) profileFields.website = website;
   if (location) profileFields.location = location;
   if (bio) profileFields.bio = bio;
   if (status) profileFields.status = status;
   if (githubusername) profileFields.githubusername =githubusername;
   if(skills) {
     profileFields.skills= skills.split(',').map(skill => skill.trim());
     //splits convert string to array and trim ignores the initial and last spaces if any
   }

   //Build social object
   profileFields.social={}
   if (youtube) profileFields.social.youtube = youtube;
   if (twitter) profileFields.social.twitter = twitter;
   if (facebook) profileFields.social.facebook =facebook;
   if (linkedin) profileFields.social.linkedin = linkedin;
   if (instagram) profileFields.social.instagram = instagram;



   try{
     let profile=await Profile.findOne({user: req.user.id});//await before mongoose object humesha
     if(profile){
       //Update
       profile=await Profile.findOneAndUpdate(
         {user:req.user.id},
         {$set:profileFields},
         {new:true, useFindAndModify: false},
         //{useFindAndModify:false}
       );

       return res.json(profile);
     }

       //Create
       profile= new Profile(profileFields);

       await profile.save();
       res.json(profile);
   }catch (err) {
     console.error(err.message);
     res.status(500).send('Server error');
    }

 }
);


module.exports= router;
