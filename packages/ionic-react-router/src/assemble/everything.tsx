import {
  AnimationBuilder,
  generateId,
  getConfig,
  IonRouterOutlet,
  LocationHistory,
  NavManager as BadNavManager,
  RouteAction,
  RouteInfo,
  RouterDirection,
  StackContext,
  StackContextState,
} from '@ionic/react';
import {
  Children,
  cloneElement,
  createElement,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useRef,
} from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutlet,
} from 'react-router-dom';
import { clonePageElement } from '../lib/utils/clonePageElement';
import {
  LocationHistoryContext,
  useLocationHistory,
} from '../Redesign/context/LocationHistoryContext';
import { IonRouteInner } from './IonRouteInner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavManager = BadNavManager as any;

export function AsIonRouteContext({ children }: PropsWithChildren) {
  return (
    <LocationHistoryContext.Provider value={new LocationHistory()}>
      <AsIonNavContext>{children}</AsIonNavContext>
    </LocationHistoryContext.Provider>
  );
}

export function AsIonNavContext({ children }: PropsWithChildren) {
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
      stackManager={AsOutletStackManager}
      routeInfo={routeInfo}
      onNativeBack={handleNativeBack}
      onNavigateBack={handleNavigateBack}
      onNavigate={handleNavigate}
      onSetCurrentTab={handleSetCurrentTab}
      onChangeTab={handleChangeTab}
      onResetTab={handleResetTab}
      locationHistory={locationHistory} // Only use? locationHistory.canGoBack()
    >
      {children}
    </NavManager>
  );
}

function generateRouteId() {
  const id = generateId('stackManager');
  console.log(`🍻 generateRouteId ; ${id}`);
  return id;
}

export function AsOutletStackManager({
  children,
  routeInfo,
}: PropsWithChildren<{ routeInfo: RouteInfo }>) {
  const stackIdRef = useRef<string>(generateRouteId());
  // Elements from React Router 6 that would be used in an <Outlet />
  const elements = useOutlet() as ReactElement;
  // An eventual ref to the ionRouterOutletInner
  const ionCoreOutletRef = useRef<HTMLIonRouterOutletElement>();

  const currentPageRef = useRef<HTMLElement>();
  const prevPageRef = useRef<HTMLElement>();

  const setIonCoreOutlet = async (node: HTMLIonRouterOutletElement) => {
    if (!node) {
      console.log(`🔩 Missing Node in setIonCoreOutlet`);
      return;
    }
    // Set up router outlet
    const canStart = () => {
      const config = getConfig();
      const swipeEnabled =
        config && config.get('swipeBackEnabled', node.mode === 'ios');
      if (swipeEnabled) {
        // UPDATE: Changing to just use the previous element
        return Boolean(prevPageRef.current);
        // return locationHistory.canGoBack();
      } else {
        return false;
      }
    };
    const onStart = () => {
      // routeManagerContext.goBack();
      console.log(`‼️ This should go back!!! ‼️`);
    };
    node.swipeHandler = {
      canStart,
      onStart,
      onEnd: (_shouldContinue) => true,
    };
    // Assign reference and handle any pending transitions
    ionCoreOutletRef.current = node;
    // if (pendingPageTransitionRef.current) {
    //   handlePageTransition({ ...pendingPageTransitionRef.current });
    // }
    if (currentPageRef.current) {
      let newLeavingElement: HTMLElement | undefined;
      if (prevPageRef.current) {
        newLeavingElement = clonePageElement(prevPageRef.current.outerHTML);
      }
      if (newLeavingElement) {
        ionCoreOutletRef.current.appendChild(newLeavingElement);
        await runCommit(routeInfo, currentPageRef.current, newLeavingElement);
        ionCoreOutletRef.current.removeChild(newLeavingElement);
      } else {
        runCommit(routeInfo, currentPageRef.current, undefined);
      }
    }
  };

  // Methods used by IonPage via PageManager & OutletPageManger
  const stackContextValue: StackContextState = useMemo(
    () => ({
      // The IonPage will call this method via PageManager
      //   It should only be called once in this stack
      registerIonPage: (page: HTMLElement, routeInfo: RouteInfo) => {
        console.log(`👀 registerIonPage`, {
          page,
          routeInfo,
        });
        prevPageRef.current = currentPageRef.current;
        currentPageRef.current = page;
      },
      isInOutlet: () => true,
    }),
    []
  );
  const ionRouterOutletInner = useMemo(
    () => Children.only(children) as ReactElement,
    [children]
  );
  console.log(`🥞🥞 AsOutletStackManager: Render : ID:${stackIdRef.current}`, [
    routeInfo,
    children,
    elements,
    ionRouterOutletInner,
  ]);

  return (
    <StackContext.Provider value={stackContextValue}>
      {cloneElement(
        ionRouterOutletInner,
        {
          ref: (node: HTMLIonRouterOutletElement) => {
            if (ionRouterOutletInner.props.setRef) {
              ionRouterOutletInner.props.setRef(node);
            }
            if (ionRouterOutletInner.props.forwardedRef) {
              ionRouterOutletInner.props.forwardedRef.current = node;
            }
            setIonCoreOutlet(node);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { ref } = ionRouterOutletInner as any; // FIX, find a way to not cast if possible
            if (typeof ref === 'function') {
              ref(node);
            }
          },
        },
        elements
      )}
    </StackContext.Provider>
  );

  /*
  FUNCTIONAL BLOCKS
  */

  // ACTUAL ANIMATION FUNCTIONALITY
  async function runCommit(
    routeInfo: RouteInfo,
    enteringEl: HTMLElement,
    leavingEl?: HTMLElement
  ) {
    console.log(`💒 runCommit: ${routeInfo.pathname}`, {
      enteringEl,
      leavingEl,
    });
    enteringEl.classList.add('ion-page');
    enteringEl.classList.add('ion-page-invisible');

    const direction =
      routeInfo.routeDirection === 'none' || routeInfo.routeDirection === 'root'
        ? undefined
        : routeInfo.routeDirection;

    if (!ionCoreOutletRef.current) {
      console.warn(
        `🛩 ⚡️ ‼️ transitionPage : NO ROUTER OUTLET : Cannot transition`
      );
      return;
    }

    console.log(`Running commit`, { routeInfo });
    const config = getConfig();
    await ionCoreOutletRef.current.commit(enteringEl, leavingEl, {
      deepWait: true,
      duration: direction === undefined ? 0 : undefined,
      direction: direction as any,
      showGoBack: !!routeInfo.pushedByRoute,
      progressAnimation: false,
      animationBuilder: routeInfo.routeAnimation,
    });

    // await ionCoreOutletRef.current.commit(enteringEl, leavingEl, {
    //   deepWait: true,
    //   duration: direction === undefined ? 0 : undefined,
    //   direction: direction as never,
    //   showGoBack: !!routeInfo.pushedByRoute,
    //   progressAnimation: false,
    //   animationBuilder: routeInfo.routeAnimation,
    // });
  }
}

export const IonOutletWrapper = () =>
  createElement(IonRouterOutlet, { children: <Outlet /> });
