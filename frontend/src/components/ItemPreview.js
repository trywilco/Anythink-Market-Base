import React from "react";
import { Link } from "react-router-dom";
import agent from "../agent";
import { connect } from "react-redux";
import { ITEM_FAVORITED, ITEM_UNFAVORITED } from "../constants/actionTypes";

const FAVORITED_CLASS = "btn btn-sm btn-primary";
const NOT_FAVORITED_CLASS = "btn btn-sm btn-outline-primary";

const mapDispatchToProps = dispatch => ({
  favorite: slug =>
    dispatch({
      type: ITEM_FAVORITED,
      payload: agent.Items.favorite(slug)
    }),
  unfavorite: slug =>
    dispatch({
      type: ITEM_UNFAVORITED,
      payload: agent.Items.unfavorite(slug)
    })
});

const ItemPreview = props => {
  const item = props.item;
  const favoriteButtonClass = item.favorited
    ? FAVORITED_CLASS
    : NOT_FAVORITED_CLASS;

  const handleClick = ev => {
    ev.preventDefault();
    if (item.favorited) {
      props.unfavorite(item.slug);
    } else {
      props.favorite(item.slug);
    }
  };

  return (
    <div className="item-preview">
      <div className="item-meta">
        <Link to={`/@${item.seller.username}`}>
          <img src={item.seller.image} alt={item.seller.username} />
        </Link>

        <div className="info">
          <Link className="seller" to={`/@${item.seller.username}`}>
            {item.seller.username}
          </Link>
          <span className="date">
            {new Date(item.createdAt).toDateString()}
          </span>
        </div>

        <div className="pull-xs-right">
          <button className={favoriteButtonClass} onClick={handleClick}>
            <i className="ion-heart"></i> {item.favoritesCount}
          </button>
        </div>
      </div>

      <Link to={`/item/${item.slug}`} className="preview-link">
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {item.tagList.map(tag => {
            return (
              <li className="tag-default tag-pill tag-outline" key={tag}>
                {tag}
              </li>
            );
          })}
        </ul>
      </Link>
    </div>
  );
};

export default connect(
  () => ({}),
  mapDispatchToProps
)(ItemPreview);
