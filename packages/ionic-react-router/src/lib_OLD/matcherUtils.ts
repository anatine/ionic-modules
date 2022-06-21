import { RouteInfo } from '@ionic/react';
import React from 'react';
import { matchPath, Params } from 'react-router-dom';

export function matchRoute(node: React.ReactNode, routeInfo: RouteInfo) {
  let matchedNode: React.ReactNode;
  React.Children.forEach(
    node as React.ReactElement,
    (child: React.ReactElement) => {
      // console.log(`matchRoute`, { routeInfo, child });
      if (!child) {
        console.warn(`matchComponent: node is null`);
      }
      if (!child.props) {
        console.warn(`matchComponent: node has no props`);
      }

      const path = child.props?.path;
      const match = Boolean(path) && matchPath({ path }, routeInfo.pathname);
      if (match) {
        // console.log(
        //   `>>>>>>>  matchRoute: match: ${path} -> ${routeInfo.pathname}`,
        //   child
        // );
        matchedNode = child;
      }
    }
  );

  if (matchedNode) {
    return matchedNode;
  }
  // If we haven't found a node
  // try to find one that doesn't have a path or from prop, that will be our not found route
  React.Children.forEach(
    node as React.ReactElement,
    (child: React.ReactElement) => {
      if (!child.props?.path) {
        matchedNode = child;
      }
    }
  );

  return matchedNode;
}

export function matchComponent(
  node: React.ReactElement,
  pathname: string,
  forceExact?: boolean
) {
  if (!node) {
    console.warn(`matchComponent: node is null`);
    return undefined;
  }
  const path =
    forceExact && !node.props?.path?.endsWith('/*')
      ? `${node.props?.path}/*`
      : node.props?.path;

  if (!path) {
    console.warn(`matchComponent: node has no path`, node);
  }
  const match = path ? matchPath({ path }, pathname) : null;

  return convertToV5Match(match);
}

export function matchRouteData(
  routeData: any,
  pathname: string,
  forceExact?: boolean
) {
  if (!routeData) {
    console.warn(`matchComponent: routeData is null`);
    return undefined;
  }
  const rawPath = routeData.childProps.path;
  const path =
    forceExact && !rawPath?.endsWith('/*') ? `${rawPath}/*` : rawPath;

  if (!path) {
    console.warn(`matchComponent: routeInfo has no path`, routeData);
  }
  const match = path ? matchPath({ path }, pathname) : null;

  return convertToV5Match(match);
}

export interface V5Match {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}
export function convertToV5Match(
  match?: ReturnType<typeof matchPath>
): V5Match | undefined {
  if (!match) return;
  return {
    isExact: match?.pathname.endsWith('/*'),
    params: match?.params,
    path: match?.pathname,
    url: match?.pathnameBase,
  };
}
