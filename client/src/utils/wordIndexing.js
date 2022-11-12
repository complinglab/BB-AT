// Make an array of tuples containing position of forms in the sentence.Text [(start, end), ...]
const wordIndexing = (sentence) => {
  var words = sentence.Words.map((x) => x.Form);

  var wordIndex = [];
  var sliceFlag = 0;
  for (let i = 0; i < words.length; i++) {
    // console.log(i)
    console.log(sentence);
    console.log('SLICE FLAG', sliceFlag);
    var wordLength = words[i].length;

    var slicedStart = sentence.indexOf(words[i]);
    var startPos = sentence.indexOf(words[i]) + sliceFlag;
    var endPos = startPos + wordLength - 1;
    sentence = sentence.slice(endPos + 1 - sliceFlag);
    sliceFlag += wordLength + slicedStart;
    wordIndex.push([startPos, endPos]);
  }
  return wordIndex;
};

export default wordIndexing;

// wordIndex = wordIndexing(sentence.Text, words)
// table = words.map((e,i) => {
//     return [e, wordIndex[i]]
// })

// console.table(table)
// console.log(unicodeLength(sentence.Text))
// console.log(sentence.Text.length)
// console.table(wordIndex)

// function unicodeLength(str) {
//     return [...str].length
//   }
