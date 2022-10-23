import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import PlasticineApi from '../../../api';
import Form from '../../../components/content/form';
import Page from './page';
import Loader from '../../../components/shared/loader';
import { downloadView } from '../../../helpers';

export default class Provider extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      record: PropTypes.object,
      form: PropTypes.object,
      fields: PropTypes.array.isRequired,
      actions: PropTypes.array.isRequired,
      uiRules: PropTypes.array.isRequired,
      extraFieldsAttributes: PropTypes.array.isRequired,
      page: PropTypes.object,
      variables: PropTypes.object,
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func.isRequired,
      uploadAttachments: PropTypes.func.isRequired,
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
    }),
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
    sandbox: PropTypes.object.isRequired,
  }

  static childContextTypes = {
    form: PropTypes.object,
  }

  getChildContext() {
    return {
      form: this.form,
    };
  }

  componentDidMount() {
    this.setContent(this.props, this.context);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps, this.context);
  }

  componentWillUnmount() {
    this.unsetContent(this.context);
  }

  setContent = ({ props }, context) => {
    context.record.subscribe(this.reRender);

    if (!isEqual(this.form, props.form)) {
      this.form = props.form;
    }
  }

  unsetContent = (context) => {
    context.record.unsubscribe(this.reRender);
    delete this.form;
  }

  reRender = () => this.forceUpdate();

  exportForm = (options) => {
    let params = { filter: `id = ${this.context.record.get('id')}` };
    if (['pdf', 'docx'].includes(options.format)) {
      params = { ...params, orientation: options.orientation, exportType: 'form' }
    }
    downloadView(this.props.props.model.alias, options.format, params);
  }

  handleAction = (model, action, options) => {
    const { callbacks: { handleAction } } = this.props;
    handleAction(model, action, options);
  }

  uploadAttachments = (attachments) => {
    const { props: { model }, callbacks: { uploadAttachments } } = this.props;
    if (attachments.length) return uploadAttachments(model, this.context.record.attributes, attachments);
  }

  getAccessibleActions = () => {
    const { props: { model, actions } } = this.props;

    return actions.filter((a = {}) => {
      return a.group || this.context.record.isActionVisible(a.alias);
    });
  }

  onPageChange = (attributes) => this.context.record.baseOnChange(attributes)

  renderForm() {
    const { props: { model, form, fields }, callbacks: { goBack, refresh, changeRecord } } = this.props;
    const { record } = this.context;

    const actions = this.getAccessibleActions();
    const callbacks = {
      handleAction: this.handleAction,
      uploadAttachments: this.uploadAttachments,
      exportForm: this.exportForm,
      goBack,
      refresh,
      changeRecord,
    };

    return (
      <Form
        model={model}
        form={form}
        record={record}
        fields={fields}
        callbacks={callbacks}
        actions={actions}
      />
    );
  }

  renderPage() {
    const { props: { model, form, fields, page } } = this.props;
    const { record } = this.context;

    const attributes = { ...record.attributes, __inserted: record.metadata.inserted };
    const variables = { ...this.props.props.variables, record: attributes, formFields: fields };
    const actions = this.getAccessibleActions();
    const callbacks = {
      handleAction: this.handleAction,
      exportForm: this.exportForm,
    };

    return (
      <Form
        model={model}
        form={form}
        record={record}
        callbacks={callbacks}
        actions={actions}
      >
        <Page
          page={page}
          sandbox={this.context.sandbox}
          variables={variables}
          actions={actions}
          handleAction={this.handleAction}
          onChange={this.onPageChange}
        />
      </Form>
    );
  }

  render() {
    if (!this.context.record.id) return <Loader />;

    return this.props.props.page ? this.renderPage() : this.renderForm();
  }
}
