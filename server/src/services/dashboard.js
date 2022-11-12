const { User } = require('../models/user');
const { Task } = require('../models/task');
const { Parameter } = require('../models/parameter');


exports.dataFetch = async () => {
    let tasks = await Task.find()
    let users = await User.find({role: "subject"})
    let para = await Parameter.find()

    users.map( ({password, age, isVerified, ...rest}) => rest );

    return {tasks, users, para: para[0]}
}

exports.updateParameter = async (data) => {
    
    let {oldValue, newValue, field} = data
    
    res = await Parameter.findOneAndUpdate(
        { [field]: oldValue },
        { [field]: newValue }
        )
    console.log(res)
    if(!res) throw new Error(`Couldn't find parameter ${field} with value ${oldValue} to update`)
    else return "parameter updated"
}

exports.updateTag = async (data) => {
    
    let { tags } = data
    console.log(tags)
    res = await Parameter.findOneAndUpdate(
        {},
        { tags },
        )
    
    if(!res) throw new Error(`Couldn't find parameter object`)
    
    return ;
}