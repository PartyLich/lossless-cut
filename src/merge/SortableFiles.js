import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  sortableContainer,
  sortableElement,
  arrayMove,
} from 'react-sortable-hoc';
import { basename } from 'path';

import './SortableItem.scss';


const SortableItem = sortableElement(({ value, sortIndex }) => (
  <div className="SortableItem" title={value}>
    {sortIndex + 1}
    {'. '}
    {basename(value)}
  </div>
));

const SortableContainer = sortableContainer(({ items }) => (
  <div>
    {items.map((value, index) => (
      <SortableItem key={value} index={index} sortIndex={index} value={value} />
    ))}
  </div>
));

const SortableFiles = (props) => {
  const [items, setItems] = useState(props.items);
  const { helperContainer } = props;

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    props.onChange(newItems);
  };

  return (
    <div>
      <div><b>Sort your files for merge</b></div>
      <SortableContainer
        items={items}
        onSortEnd={onSortEnd}
        helperContainer={helperContainer}
        getContainer={() => helperContainer().parentNode}
        helperClass="dragging-helper-class"
      />
    </div>
  );
};

SortableFiles.propTypes = {
  onChange: PropTypes.func.isRequired,
  helperContainer: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
};

export default SortableFiles;
