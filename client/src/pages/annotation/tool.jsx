// Loading stages: tags >> task + subjectData(if it exists) >> subjectData(if it didnt exist) + sentIndex >> Render task
import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import DefaultTippy from '@tippyjs/react';
import Spinner from 'react-bootstrap/Spinner';

import Loading from '../../components/Loading';
import styles from '../../styles/Tool.module.css';
import * as api from '../../services/tool';
import Progress from '../../components/Progress';
import Continue from '../../components/Continue';
import TaskFinished from '../../components/TaskFinished';

let cx = classNames.bind(styles);

const Tool = (props) => {
  const history = useHistory();

  // const [signin, setSignin] = useState(false)
  const [tagSet, setTagSet] = useState(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [noTasks, setNoTasks] = useState(false);
  const [taskError, setTaskError] = useState(null);

  const [task, setTask] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [taskIndex, setTaskIndex] = useState(null);

  const [startRt, setStartRt] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [startSentRt, setStartSentRt] = useState(null);
  const [sentIndex, setSentIndex] = useState(null);
  const [allWordsTagged, setAllWordsTagged] = useState(false);

  // Buttons
  const [onBreak, setBreak] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savingSent, setSavingSent] = useState(false);
  const [sentSaveError, setSentSaveError] = useState(false);

  // States for task finish flow
  const [finishingTask, setFinishingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [finishError, setFinishError] = useState(null);
  const [taskFin, setTaskFin] = useState(false);

  // Get previously selected word
  const prevSelectedWordRef = useRef(null);
  useEffect(() => {
    prevSelectedWordRef.current = selectedWord;
  });
  const prevSelectedWord = prevSelectedWordRef.current;

  // Get previously selected sentence
  const prevSelectedSentRef = useRef(null);
  useEffect(() => {
    prevSelectedSentRef.current = sentIndex;
  });
  const prevSelectedSent = prevSelectedSentRef.current;

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

          setTask(res);
          setSubjectData(res.subjectData);
          setTaskIndex(res.taskCount);
        })
        .catch((err) => {
          console.log('err', err);
          if (err.message === 'No tasks available') setNoTasks(true);
          setTaskError(err.message);
          // Configure for cases when auth fails
          // if (res.status===403) props.history.push('/')
        });
    }
  }, [tagSet]);

  // Loading subject data from previous session
  useEffect(() => {
    if (subjectData) {
      // Create new working data if task is loaded for the first time
      if (subjectData.data.length === 0) {
        let data = [];
        task.sents.forEach((sent) => {
          let placeholder = {};
          placeholder.wordRTs = Array(sent.words.length).fill(null);
          placeholder.wordTags = Array(sent.words.length).fill(null);
          placeholder.sentRT = null;
          placeholder.sentId = sent.sentId;
          data.push(placeholder);
        });
        setSubjectData((prev) => ({ ...prev, data }));
      }
      setSentIndex(subjectData.sentIndex);
      setTaskLoading(false); // Start rendering the task
    }
  }, [subjectData]);

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

  // Update subjectdata with new sentIndex
  // Update sentence RT
  useEffect(() => {
    if (prevSelectedSent !== null) {
      let endRT = new Date();
      let rt = endRT - startSentRt + subjectData.data[prevSelectedSent].sentRT;
      let updatedData = subjectData;
      updatedData.data[prevSelectedSent].sentRT = rt;
      setSubjectData(updatedData);
    }
    let startNewRt = new Date();
    setStartSentRt(startNewRt);
  }, [sentIndex]);

  // RT counter for selected word
  useEffect(() => {}, [selectedWord]);

  // Update word RT whenever selected word changes
  useEffect(() => {
    let endRT = new Date();
    if (selectedWord !== null) {
      // Add RT when new word is selected without the previously selected word is tagged
      if (prevSelectedWord !== null) {
        let rt =
          endRT -
          startRt +
          subjectData.data[sentIndex].wordRTs[prevSelectedWord];
        let updatedData = subjectData;
        updatedData.data[sentIndex].wordRTs[prevSelectedWord] = rt;
        setSubjectData(updatedData);
      }
    }
    let startNewRt = new Date();
    setStartRt(startNewRt);
    setSaveError(false);
  }, [selectedWord]);

  // Add RT and tag on clicking tag button and reset selected word to null
  const onTagClick = (tag) => {
    let endRT = new Date();
    let rt =
      endRT - startRt + subjectData.data[sentIndex].wordRTs[selectedWord];
    let updatedData = subjectData;
    updatedData.data[sentIndex].wordRTs[selectedWord] = rt;
    updatedData.data[sentIndex].wordTags[selectedWord] = tag;
    setSubjectData(updatedData);
    setSelectedWord(null);
  };

  // General case where word RT has to be saved before reseting selection to null
  const saveWordRtAndReset = () => {
    if (selectedWord !== null) {
      let endRT = new Date();
      let rt =
        endRT - startRt + subjectData.data[sentIndex].wordRTs[selectedWord];
      let updatedData = subjectData;
      updatedData.data[sentIndex].wordRTs[selectedWord] = rt;
      setSubjectData(updatedData);
      setSelectedWord(null);
    }
  };

  const handleNextSent = async () => {
    try {
      setSavingSent(true);
      saveWordRtAndReset();
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
      setSavingSent(true);
      saveWordRtAndReset();
      await saveAnnotatedSentData(false);
      setSentSaveError(false);
      setSentIndex((prev) => prev - 1);
    } catch (error) {
      setSentSaveError(true);
    }
    setSavingSent(false);
  };

  // BREAK FUNCTIONS
  const handleShow = () => {
    // update word RT if necessary
    saveWordRtAndReset();

    // update sentence RT
    let endRT = new Date();
    let rt = endRT - startSentRt + subjectData.data[sentIndex].sentRT;
    let updatedData = subjectData;
    updatedData.data[sentIndex].sentRT = rt;
    setSubjectData(updatedData);

    setBreak(true);
  };
  const handleClose = () => {
    // Continue tracking sentence RT
    let startNewRt = new Date();
    setStartSentRt(startNewRt);
    setBreak(false);
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
    saveWordRtAndReset();
    // Save sentence RT of last sentence
    let endRT = new Date();
    let rt = endRT - startSentRt + subjectData.data[sentIndex].sentRT;
    let updatedData = subjectData;
    updatedData.data[sentIndex].sentRT = rt;
    setSubjectData(updatedData);

    let startNewRt = new Date();
    setStartSentRt(startNewRt);
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
      <div
        className={styles.finishContainer}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
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
                    zIndex={1}
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

          <div className={styles.sentButtonContainer}>
            <Button
              variant='primary'
              onClick={() => handlePrevSent()}
              style={{ margin: 10 }}
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
              disabled={
                !(sentIndex + 1 === subjectData.data.length && allWordsTagged)
              }
              variant='primary'
              onClick={() => handleFinishTask()}
              data-test='button-finish'
            >
              Finish Task
            </Button>

            <Button
              variant='primary'
              onClick={() => handleNextSent()}
              style={{ margin: 10 }}
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

          <Button
            className={styles.exitButton}
            variant='primary'
            onClick={handleShow}
            style={{ alignSelf: 'center' }}
          >
            Take a break
          </Button>

          <Modal
            show={onBreak}
            onHide={handleClose}
            backdrop='static'
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>On a break</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Get refreshed and continue when you are ready.
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleClose}>
                Continue
              </Button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className={styles.tagButtonsContainer}>
          {tagSet.map((tagObj, i) => (
            <DefaultTippy
              key={i}
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
