import {
  AnimationBuilder,
  generateId,
  getConfig,
  LocationHistory,
  NavManager as BadNavManager,
  RouteAction,
  RouteInfo,
  RouterDirection,
} from '@ionic/react';
import { PropsWithChildren, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import {
  LocationHistoryContext,
  useLocationHistory,
} from './context/LocationHistoryContext';
import { IonRouteInner } from './IonRouteInner';
import { StackManager } from './StackManager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavManager = BadNavManager as any;

export function IonNavigationContext({ children }: PropsWithChildren) {
  return (
    <LocationHistoryContext.Provider value={new LocationHistory()}>
      <IonInnerNavContext>{children}</IonInnerNavContext>
    </LocationHistoryContext.Provider>
  );
}

export function IonInnerNavContext({ children }: PropsWithChildren) {
  const locationHistory = useLocationHistory();
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const previousRouteInfo = useRef<RouteInfo>();
  // For tab navigation
  const currentTabRef = useRef<string>();
  // Used to store navigation changes that occur before route changes
  const incomingRouteParamsRef = useRef<Partial<RouteInfo>>({});

  const routeInfo: RouteInfo = useMemo(() => {
    let incomingRouteParams = incomingRouteParamsRef.current || {};
    const currentTab = currentTabRef.current;

    if (!locationHistory.current()) {
      locationHistory.add({
        id: generateId('routeInfo'),
        pathname: location.pathname,
        search: location.search,
      });
      return locationHistory.current();
    }

    const leavingLocationInfo: RouteInfo =
      incomingRouteParams.routeAction === 'replace'
        ? locationHistory.previous()
        : locationHistory.current();
    const leavingUrl =
      leavingLocationInfo?.pathname + leavingLocationInfo?.search;

    console.log(
      `🗺 Generating routeInfo : ${location.pathname} ${location.search}`,
      {
        state: location.state,
        incomingRouteParams,
        leavingLocationInfo,
      }
    );

    // If the route hasn't changed, return the current routeInfo
    if (leavingUrl === location.pathname) {
      if (!previousRouteInfo.current) {
        previousRouteInfo.current = {
          id: generateId('routeInfo'),
          pathname: location.pathname,
          search: location.search,
        };
      }
      return previousRouteInfo.current;
    }

    if (!incomingRouteParams) {
      if (navigationType === 'REPLACE') {
        incomingRouteParams = {
          routeAction: 'replace',
          routeDirection: 'none',
          tab: currentTab, // TODO this isn't legit if replacing to a page that is not in the tabs
        };
      }
      if (navigationType === 'POP') {
        const currentRoute = locationHistory.current();
        if (currentRoute && currentRoute.pushedByRoute) {
          const prevInfo = locationHistory.findLastLocation(currentRoute);
          incomingRouteParams = {
            ...prevInfo,
            routeAction: 'pop',
            routeDirection: 'back',
          };
        } else {
          incomingRouteParams = {
            routeAction: 'pop',
            routeDirection: 'none',
            tab: currentTab,
          };
        }
      }
      if (!incomingRouteParams) {
        incomingRouteParams = {
          routeAction: 'push',
          routeDirection: location.state?.direction || 'forward',
          routeOptions: location.state?.routerOptions,
          tab: currentTab,
        };
      }
    }

    let routeInfo: RouteInfo;

    // If route has an id, make sure all fields are set and assign to locationHistory
    if (incomingRouteParams.id) {
      routeInfo = {
        ...incomingRouteParams,
        id: incomingRouteParams.id,
        pathname: incomingRouteParams.pathname || location.pathname,
        search: incomingRouteParams.search || location.search,
        lastPathname: leavingLocationInfo.pathname,
      };
      locationHistory.add(routeInfo);
    } else {
      // Start RouteInfo
      routeInfo = {
        id: generateId('routeInfo'),
        ...incomingRouteParams,
        lastPathname: leavingLocationInfo.pathname,
        pathname: location.pathname,
        search: location.search,
        // params: this.props.match.params, // TODO: Investigate if this is needed
        prevRouteLastPathname: leavingLocationInfo.lastPathname,
      };
      if (
        incomingRouteParams.routeAction === 'push' &&
        incomingRouteParams.routeDirection === 'forward'
      ) {
        routeInfo.tab = leavingLocationInfo.tab;
        routeInfo.pushedByRoute = leavingLocationInfo.pathname;
      } else if (routeInfo.routeAction === 'pop') {
        const r = locationHistory.findLastLocation(routeInfo);
        routeInfo.pushedByRoute = r?.pushedByRoute;
      } else if (
        routeInfo.routeAction === 'push' &&
        routeInfo.tab !== leavingLocationInfo.tab
      ) {
        // If we are switching tabs grab the last route info for the tab and use its pushedByRoute
        const lastRoute = locationHistory.getCurrentRouteInfoForTab(
          routeInfo.tab
        );
        routeInfo.pushedByRoute = lastRoute?.pushedByRoute;
      } else if (routeInfo.routeAction === 'replace') {
        // Make sure to set the lastPathname, etc.. to the current route so the page transitions out
        const currentRouteInfo = locationHistory.current();

        /**
         * If going from /home to /child, then replacing from
         * /child to /home, we don't want the route info to
         * say that /home was pushed by /home which is not correct.
         */
        const currentPushedBy = currentRouteInfo?.pushedByRoute;
        const pushedByRoute =
          currentPushedBy !== undefined &&
          currentPushedBy !== routeInfo.pathname
            ? currentPushedBy
            : routeInfo.pushedByRoute;

        routeInfo.lastPathname =
          currentRouteInfo?.pathname || routeInfo.lastPathname;
        routeInfo.prevRouteLastPathname = currentRouteInfo?.lastPathname;
        routeInfo.pushedByRoute = pushedByRoute;
        routeInfo.routeDirection =
          currentRouteInfo?.routeDirection || routeInfo.routeDirection;
        routeInfo.routeAnimation =
          currentRouteInfo?.routeAnimation || routeInfo.routeAnimation;
      }

      locationHistory.add(routeInfo);
    }

    // Clear out the incomingRouteParams and return the route info
    incomingRouteParamsRef.current = {};
    return routeInfo;
  }, [
    location.pathname,
    location.search,
    location.state,
    navigationType,
    locationHistory,
  ]);

  console.log(`🗺 RouteInfo FINAL: `, {
    routeInfo,
    current: locationHistory.current(),
  });

  const handleNavigate = (
    path: string,
    routeAction: RouteAction,
    routeDirection?: RouterDirection,
    routeAnimation?: AnimationBuilder,
    routeOptions?: never,
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
    defaultHref?: string,
    routeAnimation?: AnimationBuilder
  ) => {
    const config = getConfig();
    // TODO: The typings for path are not great
    const path: string = defaultHref
      ? defaultHref
      : (config && config.get('backButtonDefaultHref' as never)) ?? '/';
    const routeInfo = locationHistory.current();
    if (routeInfo && routeInfo.pushedByRoute) {
      const prevInfo = locationHistory.findLastLocation(routeInfo);
      if (prevInfo) {
        incomingRouteParamsRef.current = {
          ...prevInfo,
          routeAction: 'pop',
          routeDirection: 'back',
          routeAnimation: routeAnimation || routeInfo.routeAnimation,
        };
        if (
          routeInfo.lastPathname === routeInfo.pushedByRoute ||
          /**
           * We need to exclude tab switches/tab
           * context changes here because tabbed
           * navigation is not linear, but router.back()
           * will go back in a linear fashion.
           */
          (prevInfo.pathname === routeInfo.pushedByRoute &&
            routeInfo.tab === '' &&
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
        handleNavigate(path, 'pop', 'back');
      }
    } else {
      handleNavigate(path, 'pop', 'back');
    }
  };

  const handleNativeBack = () => navigate(-1);

  const handleChangeTab = (
    tab: string,
    path?: string,
    routeOptions?: never
  ) => {
    if (!path) {
      return;
    }
    const routeInfo = locationHistory.getCurrentRouteInfoForTab(tab);
    const [pathname, search] = path.split('?');
    if (routeInfo) {
      incomingRouteParamsRef.current = {
        ...routeInfo,
        routeAction: 'push',
        routeDirection: 'none',
      };
      if (routeInfo.pathname === pathname) {
        incomingRouteParamsRef.current.routeOptions = routeOptions;
        navigate(routeInfo.pathname + (routeInfo.search || ''));
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
    originalRouteOptions: never
  ) => {
    const routeInfo = locationHistory.getFirstRouteInfoForTab(tab);
    if (routeInfo) {
      const newRouteInfo = { ...routeInfo };
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
    const ri = { ...locationHistory.current() };
    if (ri.tab !== tab) {
      ri.tab = tab;
      locationHistory.update(ri);
    }
  };

  return (
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
      locationHistory={locationHistory}
    >
      {children}
    </NavManager>
  );
}
