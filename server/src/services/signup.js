const { User } = require('./../models/user');

const signup = async (email, password, age) => {
    
    const newUser = await new User({
        email: email,
        password: password,
        age: age,
        role: "experimenter"
    }).save()
    if(!newUser) {
        
    } else {
        return newUser;
    }
}

module.exports = { signup }