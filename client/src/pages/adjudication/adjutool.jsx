// Loading stages: tags >> task + annoData + subjectData(if it exists) >> mismatchedTags >> subjectData(if it didnt exist) + sentIndex >> Render task
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import DefaultTippy from '@tippyjs/react';
import Spinner from 'react-bootstrap/Spinner';
import Loading from '../../components/Loading';
import styles from '../../styles/AdjudicationTool.module.css';
import * as api from '../../services/adjutool';
import Progress from '../../components/Progress';
import Continue from '../../components/Continue';
import TaskFinished from '../../components/TaskFinished';

let cx = classNames.bind(styles);

const Tool = (props) => {
  console.log('RENDERING');
  const history = useHistory();

  // const [signin, setSignin] = useState(false)
  const [tagSet, setTagSet] = useState(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [noTasks, setNoTasks] = useState(false);
  const [taskError, setTaskError] = useState(null);

  const [task, setTask] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [annoData, setAnnoData] = useState(null);
  const [taskIndex, setTaskIndex] = useState(null);
  const [mismatchedTags, setMismatchedTags] = useState(null);
  const [labelAmbiguity, setLabelAmbiguity] = useState({});
  const [loadingLabelAmbiguity, setloadingLabelAmbiguity] = useState(true);

  const [selectedWord, setSelectedWord] = useState(null);
  const [sentIndex, setSentIndex] = useState(null);
  const [allWordsTagged, setAllWordsTagged] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savingSent, setSavingSent] = useState(false);
  const [sentSaveError, setSentSaveError] = useState(false);

  // States for task finish flow
  const [finishingTask, setFinishingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [finishError, setFinishError] = useState(null);
  const [taskFin, setTaskFin] = useState(false);

  // state for item difficulty
  const [itemDiff, setItemDiff] = useState([]);
  const [loadingItemDiff, setLoadingItemDiff] = useState(true);

  // experiment parameters
  const [annConfidence, setAnnConfidence] = useState(false);
  const [sentenceDiff, setSentenceDiff] = useState(false);

  const isLowerAmbiguity = (sentIndex, wordIndex, username, annotatorsTag) => {
    if (labelAmbiguity) {
      // find tags of other annotators
      const othersLabelAmbiguities = [];
      annoData.forEach((anno) => {
        const tag = anno.data[sentIndex].wordTags[wordIndex];
        const othersLabelAmbiguity = labelAmbiguity[anno.username][tag];
        if (anno.username !== username)
          othersLabelAmbiguities.push(othersLabelAmbiguity);
      });

      const annotatorsLabelAmbiguity = labelAmbiguity[username][annotatorsTag];

      // console.log('othersLabelAmbiguities', othersLabelAmbiguities);
      // console.log('annotatorsLabelAmbiguity', annotatorsLabelAmbiguity);

      return othersLabelAmbiguities.some(
        (amb) => amb > annotatorsLabelAmbiguity
      );
    }
  };

  // get tags
  useEffect(() => {
    api
      .tagSetFetch()
      .then((res) => {
        setTagSet(res);
      })
      .catch((err) => {
        console.log('err', err);
        setTaskError(err.message);
      });
  }, []);

  // Load task after loading tagset
  useEffect(() => {
    if (tagSet) {
      api
        .taskFetch()
        .then((res) => {
          console.log('task fetch response', res);
          console.log('annotator data:', res.annotatorsData);

          setTask(res);
          setAnnoData(res.annotatorsData);
          setSubjectData(res.subjectData);
          setTaskIndex(res.taskCount);
        })
        .catch((err) => {
          console.log('erroe:', err);
          if (err.message === 'No tasks available') setNoTasks(true);
          setTaskError(err.message);
          // Configure for cases when auth fails
          // if (res.status===403) props.history.push('/')
        });
    }
  }, [tagSet]);

  // get label ambiguity
  useEffect(() => {
    if (annoData) {
      const annotators = annoData.map((anno) => anno.username);
      console.log('annotators', annotators);
      api.labelAmbiguity({ annotators }).then((res) => {
        console.log('label ambiguity data', res);

        setLabelAmbiguity(res);
        setloadingLabelAmbiguity(false);
      });
    }
  }, [annoData]);

  // Check for mismatched tags
  useEffect(() => {
    if (task && annoData) {
      let mismatches = [];
      for (let i = 0; i < task.sents.length; i++) {
        let mismatch = [];
        for (let j = 0; j < task.sents[i].words.length; j++) {
          let prevTag = null;
          let isMismatched = false;
          // Check tag of one word across annotators.
          for (let k = 0; k < annoData.length; k++) {
            let currentTag = annoData[k].data[i].wordTags[j];

            if (!prevTag) {
              prevTag = currentTag;
              continue;
            }
            if (prevTag !== currentTag) {
              isMismatched = true;
            }
          }
          if (isMismatched) mismatch.push(j);
        }
        mismatches.push(mismatch);
      }
      setMismatchedTags(mismatches);
    }
  }, [task, annoData]);

  // get experiment data
  useEffect(() => {
    if (task) {
      api
        .getExperimentData()
        .then((data) => {
          console.log('Experiment data:', data);
          setAnnConfidence(data.parameters.annConfidence);
          setSentenceDiff(data.parameters.sentenceDiff);
        })
        .catch((err) => console.log(err));
    }
  }, [task]);

  // Loading subject data from previous session
  useEffect(() => {
    if (subjectData && mismatchedTags) {
      // Create new working data if task is loaded for the first time
      if (subjectData.data.length === 0) {
        let data = [];
        annoData[0].data.forEach((sent, i) => {
          let placeholder = {};
          placeholder.wordTags = sent.wordTags.map((tag, j) => {
            if (mismatchedTags[i].includes(j)) return null;
            else return tag;
          });
          // placeholder.wordTags = Array(sent.wordTags.length).fill(null)
          placeholder.sentId = sent.sentId;
          data.push(placeholder);
        });
        setSubjectData((prev) => ({ ...prev, data }));
      }
      setSentIndex(subjectData.sentIndex);
      setTaskLoading(false); // Start rendering the task
    }
  }, [subjectData, mismatchedTags, annoData, task]);

  // Check if all words are tagged to enable next sentence button
  useEffect(() => {
    if (sentIndex !== null) {
      let tagsCheck = subjectData.data[sentIndex].wordTags;

      for (let i = 0; i < tagsCheck.length; i++) {
        if (tagsCheck[i] === null) {
          setAllWordsTagged(false);
          return;
        }
      }
      setAllWordsTagged(true);
    }
  }, [sentIndex, JSON.stringify(subjectData)]);

  // Remove save error on selecting a word
  useEffect(() => {
    setSaveError(false);
  }, [selectedWord]);

  // Add tag on clicking tag button and reset selected word to null
  const onTagClick = (tag) => {
    let updatedData = subjectData;
    updatedData.data[sentIndex].wordTags[selectedWord] = tag;
    setSubjectData(updatedData);
    setSelectedWord(null);
  };

  // Add tag on clicking tag of annotator's sentence
  const onTagResolve = (tag, index) => {
    // setSelectedWord(null)
    console.log('tagResolve', tag, index);
    let updatedData = subjectData;
    updatedData.data[sentIndex].wordTags[index] = tag;
    setSubjectData(updatedData);
    // temporary fix for subjectdata not updating unless selectedword changes
    if (selectedWord === index) setSelectedWord(null);
    else setSelectedWord(index);
  };

  // useEffect(() => {
  //   console.log('subject data changed', subjectData);
  // }, [subjectData?.subjectId]);

  // useEffect(() => {
  //   console.log('selectedword changed');
  // }, [selectedWord]);

  // get itemdifficulty
  useEffect(() => {
    if (task && sentenceDiff) {
      api
        .getItemDifficulty()
        .then((data) => {
          // console.log(data.csvData);
          setItemDiff(data.csvData);
          setLoadingItemDiff(false);
        })
        .catch((err) => {
          console.log(err);
          setLoadingItemDiff(false);
        });
    }
  }, [task, sentenceDiff]);

  const handleNextSent = async () => {
    try {
      setSelectedWord(null);
      setSavingSent(true);
      await saveAnnotatedSentData(false);
      setSentSaveError(false);
      setSentIndex((prev) => prev + 1);
    } catch (error) {
      setSentSaveError(true);
    }
    setSavingSent(false);
  };

  const handlePrevSent = async () => {
    try {
      setSelectedWord(null);
      setSavingSent(true);
      await saveAnnotatedSentData(false);
      setSentSaveError(false);
      setSentIndex((prev) => prev - 1);
    } catch (error) {
      setSentSaveError(true);
    }
    setSavingSent(false);
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    setSaveError(false);
    try {
      await saveAnnotatedSentData(false);
      localStorage.clear();
      history.push('/');
    } catch (err) {
      setSaveError(err.message);
    }
    setIsSaving(false);
  };

  const handleFinishTask = async () => {
    setFinishingTask(true);
    setSavingTask(true);
    saveFinishedTask();
  };

  const saveFinishedTask = async () => {
    setSavingTask(true);
    try {
      await saveAnnotatedSentData(true);
      setTaskFin(true);
    } catch (err) {
      setFinishError(err.message);
    }
    setSavingTask(false);
  };

  const saveAnnotatedSentData = async (completed) => {
    let payload = {
      completed,
      taskId: task.taskId,
      treebank: task.treebank,
      sentIndex,
      subjectData,
    };

    try {
      let res = await api.taskSave(payload);
      console.log('Annotation saved', res);
      return res;
    } catch (err) {
      // Write handler for failing to save
      console.log(err.message);
      throw err;
    }
  };

  const handleContinue = () => {
    history.go();
  };

  const handleSignOut = () => {
    localStorage.clear();
    history.push('/');
  };

  function getWordBg(word, sent, annotator) {
    // console.log(sent.sentId);
    if (itemDiff.length !== 0) {
      // get items with the sentence id
      const itemsArr = itemDiff.filter((item) => item.sent_id === sent.sentId);

      // find the item containing the word/token
      const itemFound = itemsArr.find((item) => item.tokens === word);

      // console.log('Item: ', itemFound);

      // show bg color based on annotator entropy
      if (itemFound) {
        return parseFloat(itemFound[annotator]) > 0 ? 'skyblue' : 'white';
      }

      return 'white';
    }
  }

  if (noTasks) {
    return (
      <div className={styles.container}>
        <TaskFinished handleSignOut={() => handleSignOut()} status='finished' />
      </div>
    );
  }

  if (taskFin) {
    if (task.freeTasks === 0) {
      return (
        <div className={styles.container}>
          <TaskFinished
            handleSignOut={() => handleSignOut()}
            status='finished'
          />
        </div>
      );
    }
    return (
      <div className={styles.container}>
        <Continue
          handleSignOut={handleSignOut}
          handleContinue={handleContinue}
        />
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Loading error={taskError} title='Loading Task' />
      </div>
    );
  }

  if (finishingTask) {
    return (
      <div className={styles.finishContainer}>
        <Loading title='Saving task progress' error={finishError} />
        {finishError ? (
          <>
            <h3 style={{ margin: 40 }}>Error saving progress.</h3>
            <h5 style={{ margin: 40 }}>
              Please check internet connection and retry so to not lose progress
            </h5>
            <Button
              variant='danger'
              onClick={() => saveFinishedTask()}
              style={{ margin: 30 }}
              disabled={savingTask}
            >
              {savingTask ? (
                <div>
                  <Spinner
                    as='span'
                    animation='grow'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                  <span>Saving...</span>
                </div>
              ) : (
                'Retry'
              )}
            </Button>
          </>
        ) : null}
      </div>
    );
  }

  // if no label ambiguity data exists
  if (
    annConfidence &&
    Object.keys(labelAmbiguity).length === 0 &&
    !loadingLabelAmbiguity
  ) {
    console.log('no LA data');
    return (
      <div className={styles.centered}>
        <h2 className={styles.row}>Error</h2>

        <h5 className='my-4'>Label ambiguity data not found!</h5>
        <p>
          <span className={styles.note}>Note</span>: Please upload annotated
          data csv files and <br /> run 'uploadLabelAmbiguity script file'
        </p>
        <Button onClick={() => history.push('/')}>Sign out</Button>
      </div>
    );
  }

  // if item difficulty data is not available
  if (task && annoData && sentenceDiff) {
    if (loadingItemDiff && itemDiff.length === 0) {
      return <p>Loading item difficulty data...</p>;
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {Progress(taskIndex, sentIndex + 1, task.freeTasks, task.sents.length)}
      </header>

      <div className={styles.mainContainer}>
        <div className={styles.tool}>
          <div className={styles.sentenceContainer}>
            {task.sents[sentIndex]
              ? task.sents[sentIndex].words.map((word, i) => (
                  <Tippy
                    key={i}
                    render={(attrs) =>
                      subjectData.data[sentIndex].wordTags[i] !== null ? (
                        <div
                          className={styles.tippyTag}
                          tabIndex='-1'
                          {...attrs}
                        >
                          {subjectData.data[sentIndex].wordTags[i]}
                        </div>
                      ) : null
                    }
                    showOnCreate={true}
                    hideOnClick={false}
                    trigger='manual'
                    // offset={[0,(i%2)*30 + 5]} // Offset alternate tag bubble to avoid collision
                  >
                    <span
                      className={cx({
                        word: true,
                        shortWord: word.length < 3,
                        currentWord: selectedWord === i,
                      })}
                      onClick={() => setSelectedWord(i)}
                      data-test={'word'}
                    >
                      {word}
                    </span>
                  </Tippy>
                ))
              : null}
          </div>

          {annoData.map((anno) => (
            <div className={styles.sentenceContainer} key={anno.username}>
              <p className={styles.usernametext}>{anno.username}: </p>
              {task.sents[sentIndex]
                ? task.sents[sentIndex].words.map((word, i) => (
                    <Tippy
                      key={anno.username + i}
                      render={(attrs) =>
                        anno.data[sentIndex].wordTags[i] !== null ? (
                          <div
                            className={cx({
                              tippyTag: true,
                              annoTag: true,
                              mismatched: mismatchedTags[sentIndex].includes(i),
                              lowerAmbiguity:
                                annConfidence &&
                                mismatchedTags[sentIndex].includes(i) &&
                                labelAmbiguity &&
                                labelAmbiguity[anno.username] &&
                                isLowerAmbiguity(
                                  sentIndex,
                                  i,
                                  anno.username,
                                  anno.data[sentIndex].wordTags[i]
                                ),
                            })}
                            onClick={() =>
                              onTagResolve(anno.data[sentIndex].wordTags[i], i)
                            }
                            tabIndex='-1'
                            {...attrs}
                          >
                            {anno.data[sentIndex].wordTags[i]}
                          </div>
                        ) : null
                      }
                      showOnCreate={true}
                      hideOnClick={false}
                      trigger='manual'
                      interactive={true}
                      // offset={[0,(i%2)*30 + 5]} // Offset alternate tag bubble to avoid collision
                    >
                      <span
                        className={cx({
                          word: true,
                          shortWord: word.length < 3,
                        })}
                        style={{
                          backgroundColor:
                            sentenceDiff &&
                            !loadingItemDiff &&
                            itemDiff.length !== 0
                              ? getWordBg(
                                  word,
                                  task.sents[sentIndex],
                                  anno.username
                                )
                              : 'white',
                        }}
                      >
                        {word}
                        {/* {anno.normalizedData['model'][sentIndex][i]} */}
                      </span>
                    </Tippy>
                  ))
                : null}
            </div>
          ))}

          <div className={styles.sentButtonContainer}>
            <Button
              variant='primary'
              onClick={() => handlePrevSent()}
              className={styles.navigationButton}
              disabled={sentIndex < 1 || savingSent}
            >
              Previous Sentence
            </Button>

            <Button
              className={cx({
                finishButton: true,
                active:
                  sentIndex + 1 === subjectData.data.length && allWordsTagged,
              })}
              variant='primary'
              onClick={() => handleFinishTask()}
              data-test='button-finish'
            >
              Finish Task
            </Button>

            <Button
              variant='primary'
              onClick={() => handleNextSent()}
              className={styles.navigationButton}
              disabled={
                sentIndex + 1 === subjectData.data.length ||
                !allWordsTagged ||
                savingSent
              }
              data-test='button-next'
            >
              Next Sentence
            </Button>
          </div>

          <div className={styles.footer}>
            <Button
              className={styles.exitButton}
              variant='primary'
              onClick={() => handleSaveAndExit()}
              style={{ alignSelf: 'center' }}
              data-test='button-save'
            >
              {isSaving ? (
                <div>
                  <Spinner
                    as='span'
                    animation='grow'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save and Exit'
              )}
            </Button>
            {saveError && <p className={styles.errorText}>{saveError}</p>}
          </div>
        </div>

        <div className={styles.tagButtonsContainer}>
          {tagSet.map((tagObj) => (
            <DefaultTippy
              key={tagObj.tag}
              delay={200}
              content={<span>{tagObj.description}</span>}
            >
              <div title='tooltip' tabIndex='0'>
                <Button
                  key={tagObj.tag}
                  variant='outline-danger'
                  onClick={() => onTagClick(tagObj.tag)}
                  className={styles.tagButton}
                  disabled={selectedWord === null}
                  data-test={'button-tag'}
                >
                  {tagObj.tag}
                </Button>
              </div>
            </DefaultTippy>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tool;
