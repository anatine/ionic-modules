import { IonRouteProps } from '@ionic/react';
import React, { PropsWithChildren } from 'react';
import { Route } from 'react-router';

export class IonRouteInner extends React.PureComponent<
  PropsWithChildren<IonRouteProps>
> {
  // React-Router 6 no longer uses the 'exact' keyword
  //  to determine if a route is an exact match.
  //  Instead, it uses a trailing *
  // FUTURE: This will need to be fixed when @ionic/react is updated to use React-Router 6
  override render() {
    const { path: propsPath, children, ...props } = this.props;

    // Convert exact to trailing *
    const path = this.props.exact
      ? propsPath
        ? '*'
        : propsPath?.endsWith('/*')
        ? `${propsPath}/*`
        : propsPath
      : propsPath || '*';

    // Since Route gets replaced with a React.Provider
    //   pass down {show, disableIonPageManagement} into the rendered element
    return (
      <Route path={path} element={this.props.render(props)}>
        {children}
      </Route>
    );
  }
}
