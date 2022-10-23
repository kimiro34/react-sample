import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import init from '../actions/init';
import { loadUser, loadModels } from '../actions/db';
import NotificationPanel from '../components/notification-panel';
import Loader from '../components/shared/loader';
import history from '../history';
import Sandbox from '../sandbox';

const sandbox = new Sandbox({}, 'global');

class App extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
    init: PropTypes.func.isRequired,
    loadUser: PropTypes.func.isRequired,
    loadModels: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      sandbox: sandbox,
    };
  }

  async componentDidMount() {
    history.onChange(window.location);

    await this.loadMetadata();
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.ready === nextProps.ready && nextProps.authenticated === true) return;

    await this.loadMetadata();
  }

  async loadMetadata() {
    await this.props.init();
    await this.props.loadUser();
    await this.props.loadModels({ exec_by: { type: 'main_view' } });
  }

  render() {
    p.setUIObject({
      attributes: { __type: 'component' },
      api: this,
    });

    const components = [
      <NotificationPanel key="np" />,
    ];

    if (this.props.ready) {
      components.push(
        React.Children.map(this.props.children, (child) => {
          return React.isValidElement(child)
            ? React.cloneElement(child, { key: 'cc' })
            : child;
        }),
      );
    } else {
      components.push(
        <Loader
          dimmer={true}
          key="lc"
        />,
      );
    }

    return components;
  }
}

const mapStateToProps = (state) => {
  const { ready, authenticated } = state.app;

  return { ready, authenticated };
};

export default connect(mapStateToProps, {
  init,
  loadUser,
  loadModels,
})(App);
