const jwt = require('jsonwebtoken');
const authentication = (req, res, next) => {
    const authorization_header = req.headers.authorization
    const token = authorization_header.split(" ")[1]
    jwt.verify(token, 'shhhhh', function(err, decoded) {
        if(err){
            res.json('login first')
        } else{
            console.log(decoded)
            const {userId} = decoded
            req.userId = userId
            next();
        }
      });
}


module.exports = {authentication}