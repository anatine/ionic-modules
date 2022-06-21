import { generateId } from '@ionic/react';
import React from 'react';
import { PropsWithChildren, useRef } from 'react';
import { Params, Route, RouteProps, useMatch } from 'react-router';

interface V5Match {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

export interface IonRouteProps extends RouteProps {
  disableIonPageManagement?: boolean;
  show?: boolean;
  exact?: boolean; // v5 sort of support for ease of transition
  render?: (props?: { match: V5Match | null }) => JSX.Element; // v5 sort of support for ease of transition
}

export function IonRoute({
  children,
  show,
  exact,
  render,
  ...props
}: IonRouteProps) {
  const v6Match = useMatch({ path: props.path || '*' });
  const routeIdRef = useRef<string>(generateId('IonRoute'));
  const path = exact
    ? !props.path
      ? '*'
      : !props.path.endsWith('/*')
      ? `${props.path}/*`
      : props.path
    : props.path || '*';

  // Some backward compatibility-ish with v5
  const match = v6Match
    ? {
        isExact: v6Match?.pathname.endsWith('/*'),
        params: v6Match?.params,
        path: v6Match?.pathname,
        url: v6Match?.pathnameBase,
      }
    : null;

  const insert = render ? render({ match }) : null;

  // TODO Add to a ViewStack

  console.log(`⚡️ IonRoute Render: ${path}`);

  return (
    <Route {...props} path={path} id={routeIdRef.current}>
      {insert}
      {children}
    </Route>
  );
}
