import {
  Action as HistoryAction,
  History,
  Location as HistoryLocation,
  createBrowserHistory as createHistory,
  Listener,
  Update,
} from 'history';
import React from 'react';
import { RouterProps, Router } from 'react-router-dom-v5-compat';

import { IonRouter } from './IonRouter';

interface IonReactRouterProps extends RouterProps {
  history?: History;
}

export class IonReactRouter extends React.Component<IonReactRouterProps> {
  historyListenHandler?: (
    location: HistoryLocation,
    action: HistoryAction
  ) => void;
  history: History;

  constructor(props: IonReactRouterProps) {
    super(props);
    const { history, ...rest } = props;
    this.history = history || createHistory();
    this.history.listen(this.handleHistoryChange.bind(this));
    this.registerHistoryListener = this.registerHistoryListener.bind(this);
  }

  /**
   * history@4.x passes separate location and action
   * params. history@5.x passes location and action
   * together as a single object.
   * TODO: If support for React Router <=5 is dropped
   * this logic is no longer needed. We can just assume
   * a single object with both location and action.
   */
  handleHistoryChange({ location, action }: Update) {
    // TODO: why cast location as "any"?
    const locationValue = (location as any).location || location;
    const actionValue = (location as any).action || action;
    if (this.historyListenHandler) {
      this.historyListenHandler(locationValue, actionValue);
    }
  }

  registerHistoryListener(
    cb: (location: HistoryLocation, action: HistoryAction) => void
  ) {
    this.historyListenHandler = cb;
  }

  override render() {
    const { children, ...props } = this.props;
    return (
      <Router history={this.history} {...props}>
        <IonRouter registerHistoryListener={this.registerHistoryListener}>
          {children}
        </IonRouter>
      </Router>
    );
  }
}
