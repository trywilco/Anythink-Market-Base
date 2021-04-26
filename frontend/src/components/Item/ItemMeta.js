import ItemActions from './ItemActions';
import { Link } from 'react-router-dom';
import React from 'react';

const ItemMeta = props => {
  const item = props.item;
  return (
    <div className="item-meta">
      <Link to={`/@${item.seller.username}`}>
        <img src={item.seller.image} alt={item.seller.username} />
      </Link>

      <div className="info">
        <Link to={`/@${item.seller.username}`} className="seller">
          {item.seller.username}
        </Link>
        <span className="date">
          {new Date(item.createdAt).toDateString()}
        </span>
      </div>

      <ItemActions canModify={props.canModify} item={item} />
    </div>
  );
};

export default ItemMeta;
