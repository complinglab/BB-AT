import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
// import Button from 'react-bootstrap/Button';

import { updateTagsAction } from '../redux';
import styles from '../styles/TagsSorting.module.css';

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridGap: '16px',
};

const gridItemStyles = {
  height: '70px',
  backgroundColor: '#e5e5e5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const GridItem = SortableElement(({ value }) => (
  <div style={gridItemStyles}>{value}</div>
));

const Grid = SortableContainer(({ items }) => (
  <div style={gridStyles}>
    {items.map((value, index) => (
      <GridItem key={`item-${index}`} index={index} value={value} />
    ))}
  </div>
));

function TagsSort() {
  let { tagsModified, experiment } = useSelector((state) => state.expt);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tagsModified && experiment.tags) setLoading(false);
  }, [experiment.tags, tagsModified]);

  const dispatch = useDispatch();

  const onSortEnd = ({ oldIndex, newIndex }) => {
    let newTags = arrayMove(tagsModified, oldIndex, newIndex);
    dispatch(updateTagsAction({ tagsModified: [...newTags] }));
  };

  if (loading) {
    return <div className='loader'>Loading...</div>;
  }

  if (tagsModified) {
    return (
      <div className={styles.container}>
        <Grid
          items={tagsModified.map((tagObj) => tagObj.tag)}
          onSortEnd={onSortEnd}
          axis='xy'
        />
      </div>
    );
  }
  return <></>;
}

export default TagsSort;
