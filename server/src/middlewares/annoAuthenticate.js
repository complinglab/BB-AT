const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  const bearerHeader = req.headers['authorization']
  if (typeof(bearerHeader) !== 'undefined') {
      // Format of token \
      // Authorization: Bearer<access_token>
      const token = bearerHeader.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          
          if(err || (user.role!=="annotator" && user.role!=="adjudicator")) {
              console.log(err)
              res.status(403).json({ message: "Unauthorized" })
              return ;
          } else
          req.user = user;
          next();
      })
  } else {
      res.status(403).json({ message: "Unauthorized" })
  }
}

