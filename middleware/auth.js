const jwt= require('jsonwebtoken');
const config = require('config');

module.exports= function (req,res,next){
  //get token from header
  const token = req.header('x-auth-token');

  //check iif no token
  if(!token){
    return res.status(401).json({msg:'No token,authorrization denied'});
  }

  //verify token
  try{
    const decoded = jwt.verify(token,config.get('jwtSecret'));
    req.user= decoded.user;//req.user is assigned the decoded value which has user in payload
    next();

  }catch(err){
    res.status(401).json({ msg:'Token is not valid' });
  }


};
