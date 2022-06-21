import {
  generateId,
  getConfig,
  RouteInfo,
  RouteManagerContext,
  StackContext,
  StackContextState,
  ViewItem,
} from '@ionic/react';
import {
  Children,
  cloneElement,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Routes } from 'react-router-dom';
import { clonePageElement } from './clonePageElement';
import { matchComponent, matchRoute } from './matcherUtils';
import useForceUpdate from './useForceUpdate';
import usePrevious from './usePrevious';

interface StackManagerProps {
  routeInfo: RouteInfo;
}

// Helper function
const isViewVisible = (el: HTMLElement) =>
  !el.classList.contains('ion-page-invisible') &&
  !el.classList.contains('ion-page-hidden');

export function StackManager({
  children,
  routeInfo,
}: PropsWithChildren<StackManagerProps>) {
  const forceUpdate = useForceUpdate();
  const prevRouteInfo = usePrevious(routeInfo); // TODO: This is likely necessary for the forcedUpdate to work
  // Each stack manager has an ID that is used in the ViewStack
  const stackIdRef = useRef<string>(generateId('routerOutlet'));
  // When a component has not mounted, pendingPageTransition will be true when transitioning hasn't completed
  const pendingPageTransitionRef = useRef<boolean>(false);

  const routerOutletElementRef = useRef<HTMLIonRouterOutletElement>();

  // Takes the first child, which will be a IonRouterOutletInner component
  const ionRouterOutlet = useMemo(
    () => Children.only(children) as ReactElement,
    [children]
  );
  // Context provides methods for the ReactRouterViewStack
  const routeManagerContext = useContext(RouteManagerContext);
  // Effectively cloning the children of the IonRouterOutletInner component and wrapping them in a ViewLifeCycleManager context
  const components = routeManagerContext.getChildrenToRender(
    stackIdRef.current,
    ionRouterOutlet,
    routeInfo,
    () => {
      forceUpdate();
    }
  );
  console.log(
    `👀 Stack ${stackIdRef.current} Found components: ${components.length} to render`,
    components
  );

  const transitionPage = useCallback(
    async (
      routeInfo: RouteInfo,
      enteringViewItem: ViewItem,
      leavingViewItem?: ViewItem
    ) => {
      console.log(`🛩 transitionPage: ${routeInfo.pathname}`, {
        enteringViewItem,
        leavingViewItem,
      });
      const routerOutlet = routerOutletElementRef.current;

      const direction =
        routeInfo.routeDirection === 'none' ||
        routeInfo.routeDirection === 'root'
          ? undefined
          : routeInfo.routeDirection;

      if (enteringViewItem && enteringViewItem.ionPageElement && routerOutlet) {
        if (
          leavingViewItem &&
          leavingViewItem.ionPageElement &&
          enteringViewItem === leavingViewItem
        ) {
          // If a page is transitioning to another version of itself
          // we clone it so we can have an animation to show

          const match = matchComponent(
            leavingViewItem.reactElement,
            routeInfo.pathname,
            true
          );
          if (match) {
            const newLeavingElement = clonePageElement(
              leavingViewItem.ionPageElement.outerHTML
            );
            if (newLeavingElement) {
              routerOutlet.appendChild(newLeavingElement);
              await runCommit(
                enteringViewItem.ionPageElement,
                newLeavingElement
              );
              routerOutlet.removeChild(newLeavingElement);
            }
          } else {
            await runCommit(enteringViewItem.ionPageElement, undefined);
          }
        } else {
          await runCommit(
            enteringViewItem.ionPageElement,
            leavingViewItem?.ionPageElement
          );
          if (leavingViewItem && leavingViewItem.ionPageElement) {
            leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
            leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
          }
        }
      }

      async function runCommit(
        enteringEl: HTMLElement,
        leavingEl?: HTMLElement
      ) {
        console.log(`💒 runCommit: ${routeInfo.pathname}`, {
          enteringEl,
          leavingEl,
        });
        enteringEl.classList.add('ion-page');
        enteringEl.classList.add('ion-page-invisible');

        await routerOutlet?.commit(enteringEl, leavingEl, {
          deepWait: true,
          duration: direction === undefined ? 0 : undefined,
          direction: direction as never,
          showGoBack: !!routeInfo.pushedByRoute,
          progressAnimation: false,
          animationBuilder: routeInfo.routeAnimation,
        });
      }
    },
    []
  );

  const handlePageTransition = useCallback(
    async (routeInfo: RouteInfo) => {
      if (
        !routerOutletElementRef.current ||
        !routerOutletElementRef.current.commit
      ) {
        /**
         * The route outlet has not mounted yet. We need to wait for it to render
         * before we can transition the page.
         *
         * Set a flag to indicate that we should transition the page after
         * the component has updated.
         */
        pendingPageTransitionRef.current = true;
        console.log(
          `⏲ 🚸 handlePageTransition: Pending page transition`,
          routeInfo
        );
        return;
      } else {
        console.log('🔮 🚸 handlePageTransition START', routeInfo);
        let enteringViewItem = routeManagerContext.findViewItemByRouteInfo(
          routeInfo,
          stackIdRef.current
        );
        let leavingViewItem =
          routeManagerContext.findLeavingViewItemByRouteInfo(
            routeInfo,
            stackIdRef.current
          );

        if (!leavingViewItem && routeInfo.prevRouteLastPathname) {
          leavingViewItem = routeManagerContext.findViewItemByPathname(
            routeInfo.prevRouteLastPathname,
            stackIdRef.current
          );
        }

        // Check if leavingViewItem should be unmounted
        if (leavingViewItem) {
          if (routeInfo.routeAction === 'replace') {
            leavingViewItem.mount = false;
          } else if (
            !(
              routeInfo.routeAction === 'push' &&
              routeInfo.routeDirection === 'forward'
            )
          ) {
            if (
              routeInfo.routeDirection !== 'none' &&
              enteringViewItem !== leavingViewItem
            ) {
              leavingViewItem.mount = false;
            }
          } else if (routeInfo.routeOptions?.unmount) {
            leavingViewItem.mount = false;
          }
        }

        const enteringRoute = matchRoute(
          ionRouterOutlet?.props.children,
          routeInfo
        ) as ReactElement;

        if (enteringViewItem) {
          console.log(
            '🔥 🚸 handlePageTransition: setting enteringViewItem.reactElement',
            enteringViewItem
          );
          enteringViewItem.reactElement = enteringRoute;
        } else if (enteringRoute) {
          enteringViewItem = routeManagerContext.createViewItem(
            stackIdRef.current,
            enteringRoute,
            routeInfo
          );
          console.log(
            '💥 🗺 🚸 handlePageTransition: addViewItem',
            enteringViewItem
          );
          routeManagerContext.addViewItem(enteringViewItem);
        }

        if (enteringViewItem && enteringViewItem.ionPageElement) {
          /**
           * If the entering view item is the same as the leaving view item,
           * then we don't need to transition.
           */
          if (enteringViewItem === leavingViewItem) {
            /**
             * If the entering view item is the same as the leaving view item,
             * we are either transitioning using parameterized routes to the same view
             * or a parent router outlet is re-rendering as a result of React props changing.
             *
             * If the route data does not match the current path, the parent router outlet
             * is attempting to transition and we cancel the operation.
             */
            if (enteringViewItem.routeData.match.url !== routeInfo.pathname) {
              return;
            }
          }

          /**
           * If there isn't a leaving view item, but the route info indicates
           * that the user has routed from a previous path, then we need
           * to find the leaving view item to transition between.
           */
          if (!leavingViewItem && routeInfo.prevRouteLastPathname) {
            leavingViewItem = routeManagerContext.findViewItemByPathname(
              routeInfo.prevRouteLastPathname,
              stackIdRef.current
            );
          }

          /**
           * If the entering view is already visible and the leaving view is not, the transition does not need to occur.
           */
          if (
            isViewVisible(enteringViewItem.ionPageElement) &&
            leavingViewItem !== undefined &&
            !isViewVisible(leavingViewItem.ionPageElement as HTMLElement) // Typescript forcing casting, not using leavingViewItem !== undefined
          ) {
            return;
          }

          /**
           * The view should only be transitioned in the following cases:
           * 1. Performing a replace or pop action, such as a swipe to go back gesture
           * to animation the leaving view off the screen.
           *
           * 2. Navigating between top-level router outlets, such as /page-1 to /page-2;
           * or navigating within a nested outlet, such as /tabs/tab-1 to /tabs/tab-2.
           *
           * 3. The entering view is an ion-router-outlet containing a page
           * matching the current route and that hasn't already transitioned in.
           *
           * This should only happen when navigating directly to a nested router outlet
           * route or on an initial page load (i.e. refreshing). In cases when loading
           * /tabs/tab-1, we need to transition the /tabs page element into the view.
           */
          transitionPage(routeInfo, enteringViewItem, leavingViewItem);
        } else if (leavingViewItem && !enteringRoute && !enteringViewItem) {
          // If we have a leavingView but no entering view/route, we are probably leaving to
          // another outlet, so hide this leavingView. We do it in a timeout to give time for a
          // transition to finish.
          // setTimeout(() => {
          if (leavingViewItem.ionPageElement) {
            leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
            leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
          }
          // }, 250);
        }

        forceUpdate();
      }
    },
    [ionRouterOutlet, routeManagerContext, transitionPage, forceUpdate]
  );

  const setupRouterOutlet = useCallback(
    async (routerOutlet: HTMLIonRouterOutletElement) => {
      const canStart = () => {
        const config = getConfig();
        const swipeEnabled =
          config && config.get('swipeBackEnabled', routerOutlet.mode === 'ios');
        if (swipeEnabled) {
          return routeManagerContext.canGoBack();
        } else {
          return false;
        }
      };

      const onStart = () => {
        routeManagerContext.goBack();
      };
      routerOutlet.swipeHandler = {
        canStart,
        onStart,
        onEnd: (_shouldContinue) => true,
      };
    },
    [routeManagerContext]
  );

  // TODO: Replacing componentDidMount
  useEffect(() => {
    if (routerOutletElementRef.current) {
      setupRouterOutlet(routerOutletElementRef.current);
      // console.log(`SM Mount - ${this.routerOutletElement.id} (${this.id})`);
      handlePageTransition(routeInfo);
    }
  }, [setupRouterOutlet, handlePageTransition, routeInfo]);

  // TODO: Replacing componentDidUpdate
  useEffect(() => {
    if (
      routeInfo.pathname !== prevRouteInfo?.pathname ||
      pendingPageTransitionRef.current
    ) {
      handlePageTransition(routeInfo);
      pendingPageTransitionRef.current = false;
    }
  }, [setupRouterOutlet, handlePageTransition, routeInfo, prevRouteInfo]);

  // TODO: Replacing componentWillUnmount
  useEffect(
    () => () => routeManagerContext.clearOutlet(stackIdRef.current),
    [routeManagerContext]
  );

  // State for the StackContext.Provider
  const stackContextValue: StackContextState = useMemo(
    () => ({
      registerIonPage: (page: HTMLElement, routeInfo: RouteInfo) => {
        const foundView = routeManagerContext.findViewItemByRouteInfo(
          routeInfo,
          stackIdRef.current
        );
        if (foundView) {
          foundView.ionPageElement = page;
          foundView.ionRoute = true;
        }
        handlePageTransition(routeInfo);
      },
      isInOutlet: () => true,
    }),
    [routeManagerContext, handlePageTransition]
  );

  console.log(
    `🖌🖌🖌🖌🖌🖌 RENDERING STACK ${stackIdRef.current} 🖌🖌🖌🖌🖌🖌 `,
    routeInfo
  );
  return (
    <StackContext.Provider value={stackContextValue}>
      {cloneElement(
        ionRouterOutlet,
        {
          ref: (node: HTMLIonRouterOutletElement) => {
            if (ionRouterOutlet.props.setRef) {
              ionRouterOutlet.props.setRef(node);
            }
            if (ionRouterOutlet.props.forwardedRef) {
              ionRouterOutlet.props.forwardedRef.current = node;
            }
            routerOutletElementRef.current = node;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { ref } = ionRouterOutlet as any; // TODO, find a way to not cast if possible
            if (typeof ref === 'function') {
              ref(node);
            }
          },
        },
        <Routes>{components}</Routes>
      )}
    </StackContext.Provider>
  );
}
