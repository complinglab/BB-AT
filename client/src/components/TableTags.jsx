import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

import styles from '../styles/TableTags.module.css';
import { MdDeleteForever } from 'react-icons/md';
import { updateTagsAction } from '../redux';
import { Table } from 'react-bootstrap';

const TableTags = () => {
  console.log('Render TableTags');
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([null]);
  const [rows, setRows] = useState(null);
  const [tagsToggled, setTagsToggled] = useState(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    tag: '',
    description: '',
    enabled: false,
  });

  let { experiment } = useSelector((state) => state.expt);

  // Make copy of original to modify and update db later
  useEffect(() => {
    setTagsToggled(experiment.tags);
  }, [experiment.tags]);

  useEffect(() => {
    dispatch(updateTagsAction({ tagsModified: tagsToggled }));
  }, [tagsToggled, dispatch]);

  // Prepare rows and columns of table
  useEffect(() => {
    if (tagsToggled) {
      let rowsWithCheckbox = tagsToggled.map((tagObj) => {
        return {
          ...tagObj,
          enabled: Checkbox(tagObj.enabled, tagObj.tag),
          delete: DeleteTagIcon(tagObj.tag),
        };
      });

      // setRows(para.tags)
      setRows(rowsWithCheckbox);

      setColumns([
        {
          dataField: 'tag',
          text: 'Tag',
          headerStyle: { width: 140 },
        },
        {
          dataField: 'description',
          text: 'Description',
          headerStyle: { width: 250 },
        },
        {
          dataField: 'enabled',
          text: 'Enabled',
          headerStyle: { width: 90 },
        },
        {
          dataField: 'delete',
          text: 'Delete',
          headerStyle: { width: 90 },
        },
      ]);

      setLoading(false);
    }
  }, [JSON.stringify(tagsToggled)]);

  // update enabled status in working copy
  const handleToggle = (tag) => {
    setTagsToggled((prev) =>
      prev.map((tagObj) => {
        if (tagObj.tag !== tag) return tagObj;
        else return { ...tagObj, enabled: !tagObj.enabled };
      })
    );
  };

  function handleDeleteTag(tag) {
    setTagsToggled((prev) => prev.filter((tagObj) => tagObj.tag !== tag));
  }

  const Checkbox = (value, tag) => {
    return (
      <Form.Check
        type='checkbox'
        defaultChecked={value}
        onChange={() => handleToggle(tag)}
      />
    );
  };

  const DeleteTagIcon = (tag) => {
    return (
      <MdDeleteForever
        color='red'
        className={styles.deleteIcon}
        onClick={() => handleDeleteTag(tag)}
      />
    );
  };

  function handleNewTagForm(event) {
    let { name, value } = event.target;

    if (name === 'tag') {
      setNewTag((prev) => ({ ...prev, tag: value }));
    }
    if (name === 'description') {
      setNewTag((prev) => ({ ...prev, description: value }));
    }
    if (name === 'enabled') {
      let { checked } = event.target;
      setNewTag((prev) => ({ ...prev, enabled: checked }));
    }
  }

  function submitNewTag() {
    setTagsToggled((prev) => [newTag, ...prev]);

    setNewTag({
      tag: '',
      description: '',
      enabled: false,
    });
    setAddingTag(false);
  }

  if (loading) return <></>;

  return (
    <>
      <div className=''>
        {rows.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                {columns.map((col, i) => (
                  <th key={i}>{col.text}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{row.tag}</td>
                  <td>{row.description}</td>
                  <td>{row.enabled}</td>
                  <td>{row.delete}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p my={1}>No users found!</p>
        )}
      </div>

      <div className={styles.addTagContainer}>
        <Form.Row>
          {addingTag ? (
            <>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text id='basic-addon1'>Tag</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  placeholder='Tag'
                  name='tag'
                  onChange={handleNewTagForm}
                  value={newTag.tag}
                />
              </InputGroup>

              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text id='basic-addon1'>
                    Description
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  name='description'
                  placeholder='Description'
                  onChange={handleNewTagForm}
                  value={newTag.description}
                />
              </InputGroup>

              <Form.Check
                type='checkbox'
                id='autoSizingCheck'
                className='mb-2'
                name='enabled'
                label='Enable'
                defaultChecked={newTag.enabled}
                onChange={handleNewTagForm}
                value={newTag.enabled}
              />
            </>
          ) : null}
        </Form.Row>

        {addingTag ? (
          <Button
            variant='success'
            onClick={submitNewTag}
            style={{ alignSelf: 'center', marginRight: 20 }}
          >
            Submit
          </Button>
        ) : null}

        <Button
          variant={addingTag ? 'danger' : 'primary'}
          onClick={() => setAddingTag(!addingTag)}
          style={{ alignSelf: 'center', marginLeft: -5 }}
        >
          {addingTag ? 'Cancel' : 'Add Tag'}
        </Button>
      </div>
    </>
  );
};

export default TableTags;
