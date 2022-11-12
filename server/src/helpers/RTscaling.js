// Normalize RT across all words with same tags
// MinMax scaling 
exports.tagMinMaxScaling = (data) => {

  // Create a map between each tags and an array of RTs of words with that tag
  let tagRtsMap = {}
  data.forEach(sent => {
    sent.wordTags.forEach((tag, i) => {
      if (!tagRtsMap[tag]) tagRtsMap[tag]=[]
      tagRtsMap[tag].push(sent.wordRTs[i])
    })
  });

  // Normalize each array defined by the tag
  let normTagRtsMap = {}
  for (const tag in tagRtsMap) {
    if (tagRtsMap.hasOwnProperty(tag)) {
      const rts = tagRtsMap[tag];

      let max = Math.max(...rts)
      let min = Math.min(...rts) 

      normTagRtsMap[tag] = rts.map(rt => (rt-min)/(max-min))
      
    }
  }
  
  // Reconstruct the normalized rts back into the original data format
  let normalizedData = []
  data.forEach(sent => {
    let normalizedSent = []
    sent.wordTags.forEach((tag, i) => {
      let normRt = normTagRtsMap[tag].shift()
      normalizedSent.push(normRt)
    })
    normalizedData.push(normalizedSent)
  })

  return normalizedData;

}


// Normalize RT across all words in a task 
// Minmax Scaling done on deviation from mean
exports.globalDeviationScaling = (data) => {
  let rts = [];
  data.forEach(dataObj => {
    rts = [...rts, ...dataObj.wordRTs];
  });  // pooled rts
  let average = rts.reduce((a, b) => a + b) / rts.length;
  
  deviation = rts.map(rt => Math.abs(rt - average)) // deviation of rt from average

  let max = Math.max(...deviation)
  let min = Math.min(...deviation)    

  let normalizedData = []
  let index = 0

  data.forEach(dataObj => {
    normalizedSent = []
    dataObj.wordRTs.forEach(_ => {
      normalizedSent.push((deviation[index]-min)/(max-min))
      index += 1
    })
    normalizedData.push(normalizedSent)
  })

  return normalizedData;
}

// Normalize RT across all words in a task 
//  Minmax Scaling
exports.globalMinMaxScaling = (data) => {
  let rts = [];
  data.forEach(dataObj => {
    rts = [...rts, ...dataObj.wordRTs];
  });  // pooled rts
    
  let max = Math.max(...rts)
  let min = Math.min(...rts)    

  let normalizedData = []
  let index = 0

  data.forEach(dataObj => {
    normalizedSent = []
    dataObj.wordRTs.forEach(_ => {
      normalizedSent.push( (rts[index]-min)/(max-min) )
      index += 1
    })
    normalizedData.push(normalizedSent)
  })

  return normalizedData;
}


