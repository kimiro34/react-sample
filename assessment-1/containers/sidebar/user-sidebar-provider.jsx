import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UserSidebar from '../../components/sidebar/user';
import withRecordSandbox from '../hoc/with-record-sandbox';

class Provider extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    views: PropTypes.array.isRequired,
    dashboards: PropTypes.array.isRequired,
    pages: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
    record: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
    sandbox: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props);

    this.state = { record: context.record };
  }

  handleAction = (model, action, options) => {
    this.props.handleAction(model, action, options);
  }

  onChange = (attributes) => {
    const { record } = this.context;
    const newAttributes = { ...record.attributes, ...attributes };

    record.__replaceAttributes(newAttributes);
    this.setState({ record });
  }

  render() {
    const { model, models, views, dashboards, pages, actions } = this.props;

    return (
      <UserSidebar
        record={this.state.record}
        model={model}
        models={models}
        views={views}
        dashboards={dashboards}
        pages={pages}
        actions={actions}
        handleAction={this.handleAction}
      />
    );
  }
}

export default withRecordSandbox(Provider);
