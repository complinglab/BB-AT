import React from 'react';

const Progress = (taskCount, sentCount, freeTasks, totalSents) => {

  return (
    <>
      <h4>Task Number: {taskCount+1}</h4>
      <h4>Tasks Remaining: {freeTasks}</h4>
      <h4>Sentence: {sentCount>totalSents ? sentCount-1 : sentCount} of {totalSents}</h4>
    </>
    
  )
}

export default Progress