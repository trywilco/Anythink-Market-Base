import ItemMeta from './ItemMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import marked from 'marked';
import { ITEM_PAGE_LOADED, ITEM_PAGE_UNLOADED } from '../../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.item,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ITEM_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ITEM_PAGE_UNLOADED })
});

class Item extends React.Component {
  componentWillMount() {
    this.props.onLoad(Promise.all([
      agent.Items.get(this.props.match.params.id),
      agent.Comments.forItem(this.props.match.params.id)
    ]));
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    if (!this.props.item) {
      return null;
    }

    const markup = { __html: marked(this.props.item.body, { sanitize: true }) };
    const canModify = this.props.currentUser &&
      this.props.currentUser.username === this.props.item.seller.username;
    return (
      <div className="item-page">

        <div className="banner">
          <div className="container">

            <h1>{this.props.item.title}</h1>
            <ItemMeta
              item={this.props.item}
              canModify={canModify} />

          </div>
        </div>

        <div className="container page">

          <div className="row item-content">
            <div className="col-xs-12">

              <div dangerouslySetInnerHTML={markup}></div>

              <ul className="tag-list">
                {
                  this.props.item.tagList.map(tag => {
                    return (
                      <li
                        className="tag-default tag-pill tag-outline"
                        key={tag}>
                        {tag}
                      </li>
                    );
                  })
                }
              </ul>

            </div>
          </div>

          <hr />

          <div className="item-actions">
          </div>

          <div className="row">
            <CommentContainer
              comments={this.props.comments || []}
              errors={this.props.commentErrors}
              slug={this.props.match.params.id}
              currentUser={this.props.currentUser} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Item);
