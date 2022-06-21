import {
  AnimationBuilder,
  generateId,
  getConfig,
  LocationHistory,
  NavManager as BadNavManager,
  RouteAction,
  RouteInfo,
  RouteManagerContext,
  RouteManagerContextState,
  RouterDirection,
} from '@ionic/react';
import {
  Component,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router';
import { IonRouteInner } from './IonRouteInner';
import { ReactRouterViewStack } from './ReactRouterViewStack';
import { StackManager } from './StackManager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavManager = BadNavManager as any; // TODO: @ionic/react needs to update children props!!!

interface IonRouterProps {
  router: typeof Component;
}

export function IonReactRouter({
  children,
  router: Router,
}: PropsWithChildren<IonRouterProps>) {
  return (
    <Router>
      <IonRouter>{children}</IonRouter>
    </Router>
  );
}

export function IonRouter({ children }: PropsWithChildren) {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const routeInfoIdRef = useRef<string>(generateId('routeInfo'));
  const currentTabRef = useRef<string>();
  const incomingRouteParamsRef = useRef<Partial<RouteInfo>>({});
  const locationHistoryRef = useRef(new LocationHistory()); // This is almost only used locally
  const viewStackRef = useRef(new ReactRouterViewStack()); // This is only used locally

  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    id: routeInfoIdRef.current,
    pathname: location.pathname,
    search: location.search,
  });

  useEffect(() => {
    locationHistoryRef.current.add(routeInfo);
  }, [routeInfo]);

  const handleNavigate = (
    path: string,
    routeAction: RouteAction,
    routeDirection?: RouterDirection,
    routeAnimation?: AnimationBuilder,
    routeOptions?: any,
    tab?: string
  ) => {
    incomingRouteParamsRef.current = Object.assign(
      incomingRouteParamsRef.current || {},
      {
        routeAction,
        routeDirection,
        routeOptions,
        routeAnimation,
        tab,
      }
    );

    if (routeAction === 'push') {
      navigate(path);
    } else {
      navigate(path, { replace: true });
    }
  };

  const handleNavigateBack = (
    defaultHref: string | RouteInfo = '/',
    routeAnimation?: AnimationBuilder
  ) => {
    const config = getConfig();
    defaultHref = defaultHref
      ? defaultHref
      : config && config.get('backButtonDefaultHref');
    const routeInfoCurrent = locationHistoryRef.current.current();
    if (routeInfoCurrent && routeInfoCurrent.pushedByRoute) {
      const prevInfo =
        locationHistoryRef.current.findLastLocation(routeInfoCurrent);
      if (prevInfo) {
        incomingRouteParamsRef.current = {
          ...prevInfo,
          routeAction: 'pop',
          routeDirection: 'back',
          routeAnimation: routeAnimation || routeInfoCurrent.routeAnimation,
        };
        if (
          routeInfoCurrent.lastPathname === routeInfoCurrent.pushedByRoute ||
          /**
           * We need to exclude tab switches/tab
           * context changes here because tabbed
           * navigation is not linear, but router.back()
           * will go back in a linear fashion.
           */
          (prevInfo.pathname === routeInfoCurrent.pushedByRoute &&
            routeInfoCurrent.tab === '' &&
            prevInfo.tab === '')
        ) {
          navigate(-1);
        } else {
          handleNavigate(
            prevInfo.pathname + (prevInfo.search || ''),
            'pop',
            'back'
          );
        }
      } else {
        handleNavigate(defaultHref as string, 'pop', 'back');
      }
    } else {
      handleNavigate(defaultHref as string, 'pop', 'back');
    }
  };

  const handleNativeBack = () => navigate(-1);

  const handleChangeTab = (tab: string, path?: string, routeOptions?: any) => {
    if (!path) {
      return;
    }

    const routeInfoTabCurrent =
      locationHistoryRef.current.getCurrentRouteInfoForTab(tab);
    const [pathname, search] = path.split('?');
    if (routeInfoTabCurrent) {
      incomingRouteParamsRef.current = {
        ...routeInfoTabCurrent,
        routeAction: 'push',
        routeDirection: 'none',
      };
      if (routeInfoTabCurrent.pathname === pathname) {
        incomingRouteParamsRef.current.routeOptions = routeOptions;
        navigate(
          routeInfoTabCurrent.pathname + (routeInfoTabCurrent.search || '')
        );
      } else {
        incomingRouteParamsRef.current.pathname = pathname;
        incomingRouteParamsRef.current.search = search
          ? '?' + search
          : undefined;
        incomingRouteParamsRef.current.routeOptions = routeOptions;
        navigate(pathname + (search ? '?' + search : ''));
      }
    } else {
      handleNavigate(pathname, 'push', 'none', undefined, routeOptions, tab);
    }
  };

  const handleResetTab = (
    tab: string,
    originalHref: string,
    originalRouteOptions: any
  ) => {
    const routeInfoFirstTab =
      locationHistoryRef.current.getFirstRouteInfoForTab(tab);
    if (routeInfoFirstTab) {
      const newRouteInfo = { ...routeInfoFirstTab };
      newRouteInfo.pathname = originalHref;
      newRouteInfo.routeOptions = originalRouteOptions;
      incomingRouteParamsRef.current = {
        ...newRouteInfo,
        routeAction: 'pop',
        routeDirection: 'back',
      };
      navigate(newRouteInfo.pathname + (newRouteInfo.search || ''));
    }
  };

  const handleSetCurrentTab = (tab: string) => {
    currentTabRef.current = tab;
    const ri = { ...locationHistoryRef.current.current() };
    if (ri.tab !== tab) {
      ri.tab = tab;
      locationHistoryRef.current.update(ri);
    }
  };

  // TODO: History changes are wayyyy to complex...

  // Handle history changes
  useEffect(() => {
    console.log(
      '⏮ !!!!!! ⏮ useEffect, history changes?',
      locationHistoryRef.current.current(),
      {
        location,
        navigationType,
        params,
        locationHistoryRef: locationHistoryRef,
      }
    );

    let leavingLocationInfo: RouteInfo;
    if (incomingRouteParamsRef.current.id) {
      if (incomingRouteParamsRef.current.routeAction === 'replace') {
        leavingLocationInfo = locationHistoryRef.current.previous();
      } else {
        leavingLocationInfo = locationHistoryRef.current.current();
      }
    } else {
      leavingLocationInfo = locationHistoryRef.current.current();
    }

    const leavingUrl =
      leavingLocationInfo.pathname + leavingLocationInfo.search;

    if (leavingUrl !== location.pathname) {
      if (!incomingRouteParamsRef.current) {
        if (navigationType === 'REPLACE') {
          incomingRouteParamsRef.current = {
            routeAction: 'replace',
            routeDirection: 'none',
            tab: currentTabRef.current, // TODO this isn't legit if replacing to a page that is not in the tabs
          };
        }
        if (navigationType === 'POP') {
          const currentRoute = locationHistoryRef.current.current();
          if (currentRoute && currentRoute.pushedByRoute) {
            const prevInfo =
              locationHistoryRef.current.findLastLocation(currentRoute);
            incomingRouteParamsRef.current = {
              ...prevInfo,
              routeAction: 'pop',
              routeDirection: 'back',
            };
          } else {
            incomingRouteParamsRef.current = {
              routeAction: 'pop',
              routeDirection: 'none',
              tab: currentTabRef.current,
            };
          }
        }
        if (!incomingRouteParamsRef.current) {
          incomingRouteParamsRef.current = {
            routeAction: 'push',
            routeDirection: location.state?.direction || 'forward',
            routeOptions: location.state?.routerOptions,
            tab: currentTabRef.current,
          };
        }
      }

      let routeInfoIncoming: RouteInfo;

      // If it already has an ID, then it has been rendered by the system at some point
      if (incomingRouteParamsRef.current?.id) {
        routeInfoIncoming = {
          ...(incomingRouteParamsRef.current as RouteInfo), //FIX Bad casting
          lastPathname: leavingLocationInfo.pathname,
        };
        // Adds the new route data to the history stack
        locationHistoryRef.current.add(routeInfoIncoming);
      } else {
        const isPushed =
          incomingRouteParamsRef.current.routeAction === 'push' &&
          incomingRouteParamsRef.current.routeDirection === 'forward';
        routeInfoIncoming = {
          id: generateId('routeInfo'),
          ...incomingRouteParamsRef.current,
          lastPathname: leavingLocationInfo.pathname,
          pathname: location.pathname,
          search: location.search,
          params: Object.keys(params).reduce<Record<string, string | string[]>>(
            (acc, key) => {
              if (params[key] !== undefined) {
                acc[key] = params[key] as string;
              }
              return acc;
            },
            {}
          ),
          prevRouteLastPathname: leavingLocationInfo.lastPathname,
        };
        if (isPushed) {
          routeInfoIncoming.tab = leavingLocationInfo.tab;
          routeInfoIncoming.pushedByRoute = leavingLocationInfo.pathname;
        } else if (routeInfoIncoming.routeAction === 'pop') {
          const r =
            locationHistoryRef.current.findLastLocation(routeInfoIncoming);
          routeInfoIncoming.pushedByRoute = r?.pushedByRoute;
        } else if (
          routeInfoIncoming.routeAction === 'push' &&
          routeInfoIncoming.tab !== leavingLocationInfo.tab
        ) {
          // If we are switching tabs grab the last route info for the tab and use its pushedByRoute
          const lastRoute =
            locationHistoryRef.current.getCurrentRouteInfoForTab(
              routeInfoIncoming.tab
            );
          routeInfoIncoming.pushedByRoute = lastRoute?.pushedByRoute;
        } else if (routeInfoIncoming.routeAction === 'replace') {
          // Make sure to set the lastPathname, etc.. to the current route so the page transitions out
          const currentRouteInfo = locationHistoryRef.current.current();

          /**
           * If going from /home to /child, then replacing from
           * /child to /home, we don't want the route info to
           * say that /home was pushed by /home which is not correct.
           */
          const currentPushedBy = currentRouteInfo?.pushedByRoute;
          const pushedByRoute =
            currentPushedBy !== undefined &&
            currentPushedBy !== routeInfoIncoming.pathname
              ? currentPushedBy
              : routeInfoIncoming.pushedByRoute;

          routeInfoIncoming.lastPathname =
            currentRouteInfo?.pathname || routeInfoIncoming.lastPathname;
          routeInfoIncoming.prevRouteLastPathname =
            currentRouteInfo?.lastPathname;
          routeInfoIncoming.pushedByRoute = pushedByRoute;
          routeInfoIncoming.routeDirection =
            currentRouteInfo?.routeDirection ||
            routeInfoIncoming.routeDirection;
          routeInfoIncoming.routeAnimation =
            currentRouteInfo?.routeAnimation ||
            routeInfoIncoming.routeAnimation;
        }

        locationHistoryRef.current.add(routeInfoIncoming);
      }

      setRouteInfo((prev) => {
        console.log(`>> 🎁 << Setting new RouteInfo state`, {
          routeInfoIncoming,
          routeInfo: prev,
        });
        return routeInfoIncoming;
      });
    }

    console.log(
      `Restting incomingRouteParamsRef in useEffect`,
      incomingRouteParamsRef.current
    );
    incomingRouteParamsRef.current = {};
  }, [location, navigationType, params]);

  const routeMangerContextState: RouteManagerContextState = {
    canGoBack: () => locationHistoryRef.current.canGoBack(),
    clearOutlet: viewStackRef.current.clear,
    findViewItemByPathname: viewStackRef.current.findViewItemByPathname,
    getChildrenToRender: viewStackRef.current.getChildrenToRender,
    goBack: () => handleNavigateBack(),
    createViewItem: viewStackRef.current.createViewItem,
    findViewItemByRouteInfo: viewStackRef.current.findViewItemByRouteInfo,
    findLeavingViewItemByRouteInfo:
      viewStackRef.current.findLeavingViewItemByRouteInfo,
    addViewItem: viewStackRef.current.add,
    unMountViewItem: viewStackRef.current.remove,
  };

  // LEARN: RouteManagerContext is only used by StackManager
  return (
    <RouteManagerContext.Provider value={routeMangerContextState}>
      <NavManager
        ionRoute={IonRouteInner}
        ionRedirect={{}}
        stackManager={StackManager}
        routeInfo={routeInfo}
        onNativeBack={handleNativeBack}
        onNavigateBack={handleNavigateBack}
        onNavigate={handleNavigate}
        onSetCurrentTab={handleSetCurrentTab}
        onChangeTab={handleChangeTab}
        onResetTab={handleResetTab}
        locationHistory={locationHistoryRef.current} // Only use? locationHistory.canGoBack()
      >
        {children}
      </NavManager>
    </RouteManagerContext.Provider>
  );
}
