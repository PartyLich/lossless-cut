import React, { PureComponent } from 'react';
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

class SortableFiles extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
    };
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { items } = this.state;
    const { onChange } = this.props;
    const newItems = arrayMove(items, oldIndex, newIndex);
    this.setState({ items: newItems });
    onChange(newItems);
  };

  render() {
    const { helperContainer } = this.props;
    const { items } = this.state;

    return (
      <div>
        <div><b>Sort your files for merge</b></div>
        <SortableContainer
          items={items}
          onSortEnd={this.onSortEnd}
          helperContainer={helperContainer}
          getContainer={() => helperContainer().parentNode}
          helperClass="dragging-helper-class"
        />
      </div>
    );
  }
}

SortableFiles.propTypes = {
  onChange: PropTypes.func.isRequired,
  helperContainer: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
};

export default SortableFiles;
