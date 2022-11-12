export const createIdUserMap = (users) => {
  let idUserMap = {};
  users.forEach((user) => {
    idUserMap[user._id] = user;
  });
  return idUserMap;
};

export const createIdTaskMap = (tasks) => {
  let idTaskMap = {};
  tasks.forEach((task) => {
    idTaskMap[task._id] = task;
  });
  return idTaskMap;
};

export const createUserTaskMap = (users, tasks) => {
  let userTaskMap = {};
  users.forEach((user) => {
    userTaskMap[user._id] = [];
  });

  tasks.forEach((task) => {
    task.subjects.forEach((sub) => {
      userTaskMap[sub.subjectId].push(task._id);
    });
  });
  return userTaskMap;
};

// Create Treebank map to users and tasks objects
export const createTbToUserTaskMap = (users, tasks) => {
  // Get all distinct treebanks
  let treebanks = [];
  tasks.forEach((task) => {
    treebanks.push(task.treebank);
  });
  treebanks = [...new Set(treebanks)];

  // create object with treebanks as keys
  let tbMap = {};
  treebanks.forEach((tb) => {
    tbMap[tb] = {
      users: [],
      tasks: [],
    };
  });
  // Add users and tasks in their respective treebank
  users.forEach((user) => {
    if (user.task.treebank) {
      tbMap[user.task.treebank].users.push(user._id);
    }
  });
  tasks.forEach((task) => {
    tbMap[task.treebank].tasks.push(task._id);
  });

  return tbMap;
};

// Checks status of task
// Completed if task has been alloted to max number and annotated completely
// Active if task is not completed but has been alloted to atleast one person
// Inactive
export function taskStatus(task, status, numShared, numSharedAdju) {
  let count = 0;
  let adjuCount = 0;
  task.subjects.forEach((sub) => {
    if (sub.completed === true) count += 1;
  });
  task.adjudicators.forEach((sub) => {
    if (sub.completed === true) adjuCount += 1;
  });

  if (status === 'adjudicated') if (adjuCount === numSharedAdju) return true;
  if (status === 'adjudicating')
    if (adjuCount < numSharedAdju && task.adjudicators.length > 0) return true;
  if (status === 'completed')
    if (count === numShared) {
      if (task.adjudicators) {
        if (task.adjudicators.length === 0) return true;
        else return false;
      }
      return true;
    }
  if (status === 'active')
    if (count < numShared && task.subjects.length > 0) return true;
  if (status === 'inactive') if (task.subjects.length === 0) return true;
  return false;
}
