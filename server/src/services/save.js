const { Task } = require('../models/task');
const { User } = require('../models/user');

// @route GET admin/user
// @desc Saves annoted sentence data. If task is completed
//   Append to finished tasks and treebanks key
// @access user: subject
const save = async (subject, payload, role) => {
  
  let completed = (payload.taskLen === (payload.annotatedSentIndex+1))

  let data= {
  wordRTs: payload.wordRTs,
  wordTags: payload.wordTags,
  sentId: payload.sentId,
  sentenceRT: payload.sentenceRT,
  }
  console.log("Save data", data)

  let setDataUpdate = `subjects.$.data.${payload.annotatedSentIndex}`

  let updatedTask = await Task.updateOne(
  {
    "_id": payload.taskId,
    subjects: { $elemMatch: {subjectId: subject}}
  },
  {
    $set: {
    [setDataUpdate]: data,
    },
    "subjects.$.sentIndex": payload.annotatedSentIndex,
    "subjects.$.wordIndex": payload.wordIndex,
    "subjects.$.completed": completed
  }
  )

  // let updatedTask = await Task.updateOne(
  // {
  //   "_id": payload.taskId,
  //   subjects: { $elemMatch: {subjectId: subject}}
  // },
  // {
  //   $push: {
  //   "subjects.$.data": data,
  //   },
  //   "subjects.$.sentIndex": payload.sentIndex,
  //   "subjects.$.wordIndex": payload.wordIndex,
  //   "subjects.$.completed": completed
  // }
  // )

  if (completed) {
  let result = await User.findOneAndUpdate(
    { "_id": subject },
    {    
    // "task.treebank": null,
    "task.currentTask": null,
    $push: {"task.finishedTasks": payload.taskId},
    // $push: {"task.finishedTreebanks": payload.treebank}
    }
  )
  }

  return updatedTask
}


module.exports = {
  save
}