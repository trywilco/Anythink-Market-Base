import React from "react";
import agent from "../../agent";

const Tags = props => {
  const tags = props.tags;
  if (tags) {
    return (
      <div className="tag-list">
        {tags.map(tag => {
          const handleClick = ev => {
            ev.preventDefault();
            props.onClickTag(
              tag,
              page => agent.Items.byTag(tag, page),
              agent.Items.byTag(tag)
            );
          };

          return (
            <a
              href=""
              className="badge badge-pill badge-secondary p-2 m-1"
              key={tag}
              onClick={handleClick}
            >
              {tag}
            </a>
          );
        })}
      </div>
    );
  } else {
    return <div>Loading Tags...</div>;
  }
};

export default Tags;
