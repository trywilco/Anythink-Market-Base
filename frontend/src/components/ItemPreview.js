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
    <div className="card">
      <img src={item.image} className="card-img-top item-img" />
      <div className="card-body">
        <Link to={`/item/${item.slug}`} className="preview-link">
          <h3 className="card-title">{item.title}</h3>
          <p className="card-text crop-text-3">{item.description}</p>
        </Link>
        <div class="d-flex flex-row align-items-center pt-2">
          <Link to={`/@${item.seller.username}`} className="flex-grow-1">
            <img
              src={item.seller.image}
              alt={item.seller.username}
              className="user-pic pr-1"
            />
          </Link>
          <button className="btn btn-outline-secondary" onClick={handleClick}>
            <i className="ion-heart"></i> {item.favoritesCount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect(
  () => ({}),
  mapDispatchToProps
)(ItemPreview);
