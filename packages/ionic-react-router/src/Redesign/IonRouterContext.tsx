import { JSX as LocalJSX } from '@ionic/core/components';
import {
  AnimationBuilder,
  generateId,
  LocationHistory,
  NavManager as BadNavManager,
  RouteAction,
  RouteInfo,
  RouteManagerContext,
  RouteManagerContextState,
  RouterDirection,
  StackContext,
  StackContextState,
  ViewItem,
} from '@ionic/react';
import React, {
  Children,
  cloneElement,
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  BrowserRouter,
  DataBrowserRouter,
  DataHashRouter,
  DataMemoryRouter,
  HashRouter,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  RoutesProps,
  useLocation,
  useMatch,
  useNavigate,
  useOutlet,
} from 'react-router-dom';
import { useLocationHistory } from './context/LocationHistoryContext';
import usePrevious from './hooks/usePrevious';
import { IonRouteInner } from './IonRouteInner';
import { OutletStackManager } from './OutletStackManager';
import { ReactRouterViewStack } from './ReactRouterViewStack';
import { IonRouterOutletInner } from './redundant-cloning/IonRouterOutletInner';
import { clonePageElement } from './utils/clonePageElement';
import { matchComponent, matchRoute } from './utils/matcherUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavManager = BadNavManager as any;

const LocationHistoryContext = createContext<LocationHistory>(
  new LocationHistory()
);
export function IonRouterContext({ children }: PropsWithChildren) {
  const locationHistoryRef = useRef<LocationHistory>(new LocationHistory());

  console.log(`🍻 IonRouterContext`, children);
  return (
    <LocationHistoryContext.Provider value={locationHistoryRef.current}>
      {children}
      <Outlet />
    </LocationHistoryContext.Provider>
  );

  console.log(`🍻 Processing IonRoutesOutlet Children`, children);

  const wrappedKids = React.Children.map(children, (child) => {
    const type = child instanceof Object && 'type' in child && child?.type;

    if (
      type !== DataBrowserRouter &&
      type !== DataHashRouter &&
      type !== DataHashRouter &&
      type !== DataHashRouter &&
      type !== DataMemoryRouter &&
      type !== BrowserRouter &&
      type !== HashRouter &&
      type !== MemoryRouter &&
      child instanceof Object &&
      'props' in child &&
      'children' in child.props
    )
      return child;

    // Found an instance of the Router Context.
    const routerChild = child as ReactElement;
    const innerChildren = wrapRoutesInRouter(routerChild);

    return React.cloneElement(routerChild, {
      ...routerChild.props,
      children: innerChildren,
      key: routerChild.props.key || generateId('ReactRouter'),
    });
  });

  return <div>{wrappedKids}</div>;
}

function wrapRoutesInRouter(routerElement: ReactElement) {
  return React.Children.map<ReactElement, ReactElement>(
    routerElement.props.children, // Lame cast, TS should catch this from above conditions
    (route) => {
      const element = (
        <div>
          <h2>Insert!</h2>
          {route.props.element}
        </div>
      );
      return React.cloneElement(route, {
        ...route,
        element,
        key: route.props.key || generateId('ReactRouteWrapper'),
      });
    }
  );
}

type Props = LocalJSX.IonRouterOutlet & {
  basePath?: string;
  ref?: React.Ref<any>;
  ionPage?: boolean;
};

interface InternalProps extends Props {
  forwardedRef?: React.ForwardedRef<HTMLIonRouterOutletElement>;
}

export function IonRoutes({ children, location: propsLocation }: RoutesProps) {
  const locationHistory = useLocationHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const routeInfo: RouteInfo = {
    id: generateId('routeInfo'),
    pathname: location.pathname,
    search: location.search,
  };

  console.log(`🗺 IonOutlet`, children);
  return (
    <NavManager
      ionRoute={IonRouteInner}
      ionRedirect={{}}
      stackManager={() => <div>stack manager</div>}
      routeInfo={routeInfo}
      onNativeBack={() => undefined}
      onNavigateBack={() => undefined}
      onNavigate={(
        path: string,
        action: RouteAction,
        direction?: RouterDirection,
        animationBuilder?: AnimationBuilder,
        options?: any,
        tab?: string
      ) => {
        navigate(path);
      }}
      onSetCurrentTab={() => undefined}
      onChangeTab={() => undefined}
      onResetTab={() => undefined}
      locationHistory={locationHistory} // Only use? locationHistory.canGoBack()
    >
      <Routes>
        <Route
          id="IonOutletInner"
          element={<IonOutlet id="IonOutletInnerElement" />}
        >
          {children}
        </Route>
      </Routes>
    </NavManager>
  );
}

export function IonOutletOLD({ children }: PropsWithChildren) {
  const locationHistory = useLocationHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const routeInfo: RouteInfo = {
    id: generateId('routeInfo'),
    pathname: location.pathname,
    search: location.search,
  };

  console.log(`🗺 IonOutlet`, children);
  return (
    <NavManager
      ionRoute={IonRouteInner}
      ionRedirect={{}}
      stackManager={() => <div>stack manager</div>}
      routeInfo={routeInfo}
      onNativeBack={() => undefined}
      onNavigateBack={() => undefined}
      onNavigate={(
        path: string,
        action: RouteAction,
        direction?: RouterDirection,
        animationBuilder?: AnimationBuilder,
        options?: any,
        tab?: string
      ) => {
        navigate(path);
      }}
      onSetCurrentTab={() => undefined}
      onChangeTab={() => undefined}
      onResetTab={() => undefined}
      locationHistory={locationHistory} // Only use? locationHistory.canGoBack()
    >
      <Routes>
        <Route
          id="IonOutletInner"
          element={<IonOutlet id="IonOutletInnerElement" />}
        >
          {children}
        </Route>
      </Routes>
    </NavManager>
  );
}

export function IonOutlet({ children }: PropsWithChildren<{ id?: string }>) {
  const location = useLocation();
  const elements = useOutlet() as ReactElement;
  const match = useMatch(location.pathname);
  const oldElement = usePrevious(elements);
  const IonRouterOutletRef = useRef<HTMLIonRouterOutletElement>(null);
  // const routes = matchRoutes(elements, location)

  console.log('match', { match, location });

  // Top element is a react.provider created by react-router
  //    Second element is another react.provider with displayName="Route"
  //    Second element has props.value.matches with an array of matching routes
  // elements.props.children.props.value.matches[0].route.children[2].element
  console.log(`Outlet elements:::`, elements);

  return (
    <IonRouterOutletInner
      id="CLONE_IonRouterOutletInner"
      ref={IonRouterOutletRef}
    >
      {elements}
    </IonRouterOutletInner>
  );
}

export function IonRouteManagerContext({ children }: PropsWithChildren) {
  const viewStackRef = useRef(new ReactRouterViewStack()); // This is only used locally
  const locationHistoryRef = useRef<LocationHistory>(new LocationHistory());
  const handleNavigateBack = () => undefined;
  const routeMangerContextState: RouteManagerContextState = useMemo(
    () => ({
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
    }),
    []
  );
  return (
    <RouteManagerContext.Provider value={routeMangerContextState}>
      <LocationHistoryContext.Provider value={locationHistoryRef.current}>
        {children}
      </LocationHistoryContext.Provider>
    </RouteManagerContext.Provider>
  );
}

export function IonNavigationContext({ children }: PropsWithChildren) {
  const locationHistory = useLocationHistory();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`🗺 IonNavigationContext :: On Creation`);
  }, []);

  // TODO Does this need to me in state?
  const routeInfo: RouteInfo = useMemo(() => {
    console.log(
      `🗺 Generating routeInfo : ${location.pathname} ${location.search}`
    );
    return {
      id: generateId('routeInfo'),
      pathname: location.pathname,
      search: location.search,
    };
  }, [location.pathname, location.search]);

  console.log(`🗺 IonNavigationContext: ${routeInfo.id}`, children);
  return (
    <NavManager
      ionRoute={IonRouteInner}
      ionRedirect={{}}
      stackManager={OutletStackManager}
      routeInfo={routeInfo}
      onNativeBack={() => undefined}
      onNavigateBack={() => undefined}
      onNavigate={(
        path: string,
        action: RouteAction,
        direction?: RouterDirection,
        animationBuilder?: AnimationBuilder,
        options?: any,
        tab?: string
      ) => {
        navigate(path);
      }}
      onSetCurrentTab={() => undefined}
      onChangeTab={() => undefined}
      onResetTab={() => undefined}
      locationHistory={locationHistory} // Only use? locationHistory.canGoBack()
    >
      {children}
    </NavManager>
  );
}
