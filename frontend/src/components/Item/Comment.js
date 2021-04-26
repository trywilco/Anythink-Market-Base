import DeleteButton from "./DeleteButton";
import { Link } from "react-router-dom";
import React from "react";

const Comment = props => {
  const comment = props.comment;
  const show =
    props.currentUser && props.currentUser.username === comment.seller.username;
  return (
    <div className="card mb-2">
      <div className="card-body">
        <p className="card-text">{comment.body}</p>
      </div>
      <div className="card-footer">
        <div class="d-flex flex-row align-items-center pt-2">
          <Link to={`/@${comment.seller.username}`} className="user-pic mr-2">
            <img
              src={comment.seller.image}
              className="user-pic"
              alt={comment.seller.username}
            />
          </Link>
          &nbsp;
          <Link to={`/@${comment.seller.username}`} className="mr-2">
            {comment.seller.username}
          </Link>
          <span className="flex-grow-1">
            {new Date(comment.createdAt).toDateString()}
          </span>
          <DeleteButton show={show} slug={props.slug} commentId={comment.id} />
        </div>
      </div>
    </div>
  );
};

export default Comment;
