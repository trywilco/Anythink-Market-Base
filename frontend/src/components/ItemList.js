import ItemPreview from './ItemPreview';
import ListPagination from './ListPagination';
import React from 'react';

const ItemList = props => {
  if (!props.items) {
    return (
      <div className="item-preview">Loading...</div>
    );
  }

  if (props.items.length === 0) {
    return (
      <div className="item-preview">
        No items are here... yet.
      </div>
    );
  }

  return (
    <div>
      {
        props.items.map(item => {
          return (
            <ItemPreview item={item} key={item.slug} />
          );
        })
      }

      <ListPagination
        pager={props.pager}
        itemsCount={props.itemsCount}
        currentPage={props.currentPage} />
    </div>
  );
};

export default ItemList;
