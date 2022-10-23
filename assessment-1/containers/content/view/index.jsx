import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash/object';
import { isEqual } from 'lodash/lang';
import { find } from 'lodash/collection';
import qs from 'qs';

import PlasticineApi from '../../../api';
import Messenger from '../../../messenger';
import Sandbox from '../../../sandbox';
import store from '../../../store';
import history from '../../../history';
import connector from './connector';

import * as HELPERS from '../../../helpers';
import * as CONSTANTS from '../../../constants';

import Loader from '../../../components/shared/loader';
import View from '../../../components/content/view';
import ViewProps from '../../../components/content/view/props';

class ViewContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,

    viewProps: PropTypes.object.isRequired,
    viewOptions: PropTypes.object.isRequired,

    loadView: PropTypes.func.isRequired,
    openView: PropTypes.func.isRequired,
    closeView: PropTypes.func.isRequired,
    exportView: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,

    user: PropTypes.object,
  }

  getChildContext() {
    return {
      getCache: this.getCache,
      setCache: this.setCache,
    };
  }

  static childContextTypes = {
    sandbox: PropTypes.object,
    setCache: PropTypes.func,
    getCache: PropTypes.func,
  }

  getChildContext() {
    const context = { getCache: () => null, setCache: () => null };

    if (this.props.loaded) {
      context.sandbox = new Sandbox({ user: this.props.user, uiObject: {
        attributes: { ...this.props.viewProps.view, __type: 'view' },
        options: this.props.viewOptions,
      } });
    }

    return context;
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.ready !== nextProps.ready) || !nextProps.loaded
      || (!isEqual(this.props.location, nextProps.location))
      || (!isEqual(this.props.viewOptions, nextProps.viewOptions));
  }

  componentDidMount() {
    console.time('data received');
    this.openView();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.location, this.props.location)) {
      this.openView();
    }
  }

  componentWillUnmount () {
    this.props.closeView();
  }

  openView() {
    const { modelAlias, viewAlias } = this.props.params;
    const params = qs.parse(this.props.location.search.substring(1));
    const view = this.findView(viewAlias);

    if (!view) {
      Messenger.error({ header: i18n.t('view_not_found_error', { defaultValue: 'View not found' }) });
      return this.openViewAvailable();
    }

    params.exec_by = { type: 'main_view', alias: viewAlias };
    this.props.openView(modelAlias, viewAlias, params, this.props.loadView);
  }

  findView = (alias) => {
    const app = store.redux.state('metadata.app') || {};

    const model = find(app.model, { alias: this.props.params.modelAlias });
    if (!model) return;

    const attributes = { model: model.id };
    if (alias) attributes.alias = alias;

    return find(app.view, attributes);
  }

  openViewAvailable = () => {
    const view = this.findView();
    if (!view) return history.push('/');

    const params = this.props.location.search ? `?${this.props.location.search}` : '';
    const path = `/${this.props.params.modelAlias}/view/${view.type}/${view.alias}${params}`;

    return history.push(path);
  }

  updateView = (options) => {
    const { viewOptions, viewProps, location } = this.props;
    const pickedOptions = pick(viewOptions, ['sort', 'fields', 'page.number', 'filter', 'sql_debug', 'date_trunc']);
    const queryString = qs.stringify(Object.assign({}, pickedOptions, options));
    history.push(`/${viewProps.model.alias}/view/${viewProps.view.type}/${viewProps.view.alias}?${queryString}${location.hash}`);
  }

  exportView = (options) => {
    const { viewOptions = {}, viewProps = {} } = this.props;
    let pickedOptions = pick(viewOptions, ['sort', 'fields', 'page', 'filter', 'date_trunc', 'humanize']);
    if (['pdf', 'docx'].includes(options.format)) {
      if (viewProps.view.type === 'grid') {
          pickedOptions = { ...pickedOptions, pdfDocxParams: { viewAlias: viewProps.view.alias, orientation: options.orientation }}
      }
    }
    this.props.exportView(viewProps.model.alias, options.format, pickedOptions);
  }

  updateUserSettings = async (options) => {
    const { view = {} } = this.props.viewProps;

    await PlasticineApi.updateUserSettings('view', view.id, { type: 'main_view', options });
    await this.updateView(options);
  }

  handleAction = (model, action, params) => {
    const { viewProps = {}, viewOptions = {} } = this.props;
    const options = { ...params, exec_by: { type: 'view', alias: viewProps.view.alias } };

    this.props.handleAction(model, action, { viewOptions, ...options });
  }

  getProps = () => {
    const propsLoaded = pick(this.props, ['viewProps', 'viewOptions']);
    const propsCustom = { props: { context: 'main_view', hash: this.props.location.hash } };

    const context = this.getChildContext();
    const props = { ...propsLoaded, ...propsCustom };
    const callbacks = pick(this, ['handleAction', 'exportView', 'updateView', 'updateUserSettings']);

    return ViewProps.create(props, context, callbacks);
  }

  render() {
    const { ready, loaded } = this.props;
    if (!ready && !loaded) return <Loader />;

    const { props, configs, callbacks } = this.getProps();

    return (
      <View
        ready={ready}
        props={props}
        configs={configs}
        callbacks={callbacks}
      />
    );
  }
}

export default connector(ViewContainer);
