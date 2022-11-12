const jwt = require('jsonwebtoken');
const { User } = require('./../models/user');
const { SigninAuthError } = require('./../helpers/errors')
const tokenSecret = 'replace me with env'

const signin = async (email, password) => {
    let user = await User.findOne(
        {'email': email}
    )
    if(!user) {
        throw new SigninAuthError(`User not found`, 401)
    } else {
        let isMatch = await user.comparePassword(password)
        if(!isMatch) {
            throw new SigninAuthError("Incorrect Password", 401)
        } else {
            
            let token = await jwt.sign(
                {
                    sub: user.id,
                    role: user,
                },
                tokenSecret, 
                { expiresIn: "6h" }
            )
            if(!token) {
                throw new Error("Internal Server Error", 500)
            } else {
                return {token, user};
            }
            
        }
    }
}



module.exports = {
    signin
}