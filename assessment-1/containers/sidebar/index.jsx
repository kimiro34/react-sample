import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, find } from 'lodash/collection';
import { values, assign } from 'lodash/object';
import { isEmpty, isEqual } from 'lodash/lang';

import PlasticineApi from '../../api';
import SystemSidebar from '../../components/sidebar/system';
import Sandbox from '../../sandbox';
import { handleAction } from '../../actions/view/actions';
import { loadSidebar } from '../../actions/db';
import { getPage } from '../../helpers';

import UserSidebarProvider from './user-sidebar-provider';

class SidebarContainer extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    views: PropTypes.array.isRequired,

    settings: PropTypes.object.isRequired,

    sidebar: PropTypes.shape({
      system: PropTypes.shape({
        options: PropTypes.object.isRequired,
      }),
      user: PropTypes.shape({
        record: PropTypes.object,
        model: PropTypes.object,
        dashboards: PropTypes.array.isRequired,
        pages: PropTypes.array.isRequired,
        actions: PropTypes.array.isRequired,
      }),
    }),

    handleAction: PropTypes.func.isRequired,
    loadSidebar: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.setSandbox(props);
    this.setModels(props);
    this.setViews(props);
  }

  componentDidMount() {
    this.props.loadSidebar();
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  setSandbox = (props) => {
    this.sandbox = new Sandbox({ user: props.user, appSettings: props.settings });
  }

  setModels = (props) => {
    this.models = filter(values(props.models), (m) => this.sandbox.executeScript(m.access_script, { modelId: m.id }, `model/${m.id}/access_script`));
  }

  setViews = (props) => {
    this.views = filter(values(props.views), (v) => this.sandbox.executeScript(v.condition_script, { modelId: v.model }, `view/${v.id}/condition_script`));
  }

  handleUpdateSystemSidebar = (options) => {
    const page = getPage('sidebar_container');
    return PlasticineApi.updateUserSettings('page', page.id, { type: 'sidebar_container', options });
  }

  renderSystemSidebar = () => {
    return (
      <SystemSidebar
        models={this.models}
        views={this.views}
        options={this.props.sidebar.system.options}
        updateSidebar={this.handleUpdateSystemSidebar}
      />
    );
  }

  renderUserSidebar = () => {
    const { models, views, user, sidebar, handleAction } = this.props;
    const { record, model, dashboards, pages, actions } = sidebar.user;

    if (!record) return;

    return (
      <UserSidebarProvider
        record={record}
        user={user}
        model={model}
        models={models}
        views={views}
        dashboards={dashboards}
        pages={pages}
        actions={actions}
        handleAction={handleAction}
      />
    );
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {this.renderUserSidebar()}
        {this.renderSystemSidebar()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  if (!state.app.ready) return {};

  const { app, view, metadata } = state;
  const { user, readyComponents, settings } = app;

  let systemSidebarProps, userSidebarProps;

  const models = values(metadata.app.model);
  const views = values(metadata.app.view);
  const sidebar = {
    system: {
      options: view.sidebar.system
    },
    user: {
      dashboards: values(metadata.app.dashboard || {}),
      pages: values(metadata.app.page || {}),
      actions: filter(metadata.app.action || {}, { type: 'user_sidebar' }),
    },
  };

  readyComponents.includes('user_sidebar') && assign(sidebar.user, {
    record: find(values(metadata.app.user_sidebar), { active: true }),
    model: metadata.app.userSidebarModel,
  });

  return { user, models, views, settings, sidebar };
}

export default connect(mapStateToProps, { handleAction, loadSidebar })(SidebarContainer);
