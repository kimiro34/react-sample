import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { orderBy, filter } from 'lodash/collection';

import history from '../../history';

class RootContainer extends Component {
  static propTypes = {
    openPath: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const { openPath } = this.props;

    if (openPath && history.isValid({ url: openPath })) {
      history.push(this.props.openPath);
    }
  }

  render() {
    return null;
  }
}

function mapStateToProps(state) {
  const { metadata = {}, app = {} } = state;
  const { settings = {}, authenticated } = app;

  const props = { openPath: settings.start_url };

  if (authenticated) {
    props.openPath = findFirstAvailableViewPath(metadata.app);

    if (settings.home_page) {
      props.openPath = settings.home_page;
    }

    if (sessionStorage.getItem('successRedirect')) {
      props.openPath = sessionStorage.getItem('successRedirect');
      sessionStorage.removeItem('successRedirect');
    }
  }

  return props;
}

function findFirstAvailableViewPath(metadata) {
  const models = orderBy(Object.values(metadata.model || []), ['order'], ['desc']);
  let viewPath;

  for (var i = 0; i < models.length; i++) {
    const model = models[i];
    const modelViews = filter(Object.values(metadata.view || []), { model: model.id });
    const view = orderBy(modelViews, ['order'], ['desc'])[0];

    if (view) {
      viewPath = `/${model.alias}/view/${view.type}/${view.alias}`;
      break;
    }
  }

  return viewPath;
}

export default connect(mapStateToProps, {})(RootContainer);
