import {
  generateId,
  IonRoute,
  RouteInfo,
  ViewItem,
  ViewLifeCycleManager as TempViewLifeCycleManager,
  ViewStacks,
} from '@ionic/react';
import React from 'react';
import { matchComponent, matchRouteData, V5Match } from './matcherUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ViewLifeCycleManager = TempViewLifeCycleManager as any; // FIX: ViewLifeCycleManager needs prop types updated

export class ReactRouterViewStack extends ViewStacks {
  constructor() {
    super();
    this.createViewItem = this.createViewItem.bind(this);
    this.findViewItemByRouteInfo = this.findViewItemByRouteInfo.bind(this);
    this.findLeavingViewItemByRouteInfo =
      this.findLeavingViewItemByRouteInfo.bind(this);
    this.getChildrenToRender = this.getChildrenToRender.bind(this);
    this.findViewItemByPathname = this.findViewItemByPathname.bind(this);
  }

  createViewItem(
    outletId: string,
    reactElement: React.ReactElement,
    routeInfo: RouteInfo,
    page?: HTMLElement
  ) {
    const viewItem: ViewItem = {
      id: generateId('viewItem'),
      outletId,
      ionPageElement: page,
      reactElement,
      mount: true,
      ionRoute: false,
    };

    // TODO: Matching algorithm has changed in React-Router 6
    // const matchProps = {
    //   exact: reactElement.props.exact,
    //   path: reactElement.props.path || reactElement.props.from,
    //   component: reactElement.props.component,
    // };
    // const match = matchPath(routeInfo.pathname, matchProps);
    //  MATCH used to be:
    //    params: Params;
    //    isExact: boolean;
    //    path: string;
    //    url: string;
    const match = matchComponent(reactElement, routeInfo.pathname);

    if (!match) {
      console.warn(
        `Match was not found for ${routeInfo.pathname}`,
        reactElement
      );
    }

    if (reactElement.type === IonRoute) {
      viewItem.ionRoute = true;
      viewItem.disableIonPageManagement =
        reactElement.props.disableIonPageManagement;
    }

    viewItem.routeData = {
      match,
      childProps: reactElement.props,
    };

    return viewItem;
  }

  getChildrenToRender(
    outletId: string,
    ionRouterOutlet: React.ReactElement,
    routeInfo: RouteInfo
  ) {
    const viewItems = this.getViewItemsForOutlet(outletId);
    console.log(
      `Rendering outlet ${outletId} children for ${routeInfo.pathname} from ${viewItems.length} view items`,
      { routeInfo, viewItems }
    );

    // Sync latest routes with viewItems
    React.Children.forEach(
      ionRouterOutlet.props.children,
      (child: React.ReactElement) => {
        const viewItem = viewItems.find((v) => {
          return matchComponent(
            child,
            v.routeData.childProps.path || v.routeData.childProps.from
          );
        });
        if (viewItem) {
          viewItem.reactElement = child;
        }
      }
    );

    const children = viewItems.map((viewItem) => {
      // Cleaned up this logic to work with React-Router 6
      const element = (
        <ViewLifeCycleManager
          key={`view-${viewItem.id}`}
          mount={viewItem.mount}
          removeView={() => this.remove(viewItem)}
        >
          {viewItem.reactElement.props?.element}
        </ViewLifeCycleManager>
      );

      const clonedChild = React.cloneElement(viewItem.reactElement, {
        ...viewItem.reactElement.props,
        element,
        key: `route-${viewItem.id}`,
        computedMatch: viewItem.routeData.match,
      });

      if (!(viewItem.ionRoute && !viewItem.disableIonPageManagement)) {
        console.log(
          `Handle when not viewItem.ionRoute && !viewItem.disableIonPageManagement`
        );
        const match = matchComponent(viewItem.reactElement, routeInfo.pathname);
        if (!match && viewItem.routeData.match) {
          viewItem.routeData.match = undefined;
          viewItem.mount = false;
        }
      }

      return clonedChild;
    });
    return children;
  }

  findViewItemByRouteInfo(routeInfo: RouteInfo, outletId?: string) {
    const { viewItem, match } = this.findViewItemByPath(
      routeInfo.pathname,
      outletId
    );
    if (viewItem && match) {
      viewItem.routeData.match = match;
    }
    return viewItem;
  }

  findLeavingViewItemByRouteInfo(
    routeInfo: RouteInfo,
    outletId?: string,
    mustBeIonRoute = true
  ) {
    const lastPathname = routeInfo.lastPathname;
    if (!lastPathname) {
      // Catching condition for missing lastPathname
      console.warn(`No lastPathname for ${routeInfo.pathname}`);
      return;
    }
    const { viewItem } = this.findViewItemByPath(
      lastPathname,
      outletId,
      false,
      mustBeIonRoute
    );
    return viewItem;
  }

  findViewItemByPathname(pathname: string, outletId?: string) {
    const { viewItem } = this.findViewItemByPath(pathname, outletId);
    return viewItem;
  }

  private findViewItemByPath(
    pathname: string,
    outletId?: string,
    forceExact?: boolean,
    mustBeIonRoute?: boolean
  ) {
    let viewItem: ViewItem | undefined;
    // TODO: Matching algorithm has changed in React-Router 6
    let match: V5Match | undefined;
    let viewStack: ViewItem[];

    if (outletId) {
      viewStack = this.getViewItemsForOutlet(outletId);
      viewStack.some(matchView);
      if (!viewItem) {
        viewStack.some(matchDefaultRoute);
      }
    } else {
      const viewItems = this.getAllViewItems();
      viewItems.some(matchView);
      if (!viewItem) {
        viewItems.some(matchDefaultRoute);
      }
    }

    return { viewItem, match };

    function matchView(v: ViewItem) {
      if (mustBeIonRoute && !v.ionRoute) {
        return false;
      }
      // TODO: Matching algorithm has changed in React-Router 6
      // const matchProps = {
      //   exact: forceExact ? true : v.routeData.childProps.exact,
      //   path: v.routeData.childProps.path || v.routeData.childProps.from,
      //   component: v.routeData.childProps.component,
      // };
      // const myMatch = matchPath(pathname, matchProps);
      const myMatch = matchRouteData(v.routeData, pathname, forceExact);
      if (myMatch) {
        viewItem = v;
        match = myMatch;
        return true;
      }
      return false;
    }

    function matchDefaultRoute(v: ViewItem) {
      // try to find a route that doesn't have a path or from prop, that will be our default route
      if (!v.routeData.childProps.path && !v.routeData.childProps.from) {
        match = {
          path: pathname,
          url: pathname,
          isExact: true,
          params: {},
        };
        viewItem = v;
        return true;
      }
      return false;
    }
  }
}
