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
} from 'react';
import { useOutlet } from 'react-router';
import { clonePageElement } from '../lib/clonePageElement';
import { matchComponent } from '../lib/matcherUtils';
import usePrevious from './hooks/usePrevious';

export interface OutletStackManagerProps {
  routeInfo: RouteInfo;
}

function generateRouteId() {
  const id = generateId('routerOutlet');
  console.log(`🍻 generateRouteId ; ${id}`);
  return id;
}

export function OutletStackManager({
  children,
  routeInfo,
}: PropsWithChildren<OutletStackManagerProps>) {
  const stackIdRef = useRef<string>(generateRouteId());
  // Elements from React Router 6 that would be used in an <Outlet />
  const elements = useOutlet() as ReactElement;
  const previousElements = usePrevious(elements);

  const pendingPageTransitionRef = useRef<RouteInfo | null>(null);
  // An eventual ref to the ionRouterOutletInner
  const ionCoreOutletRef = useRef<HTMLIonRouterOutletElement>();
  // Context provides methods for the ReactRouterViewStack
  const routeManagerContext = useContext(RouteManagerContext);

  // ACTUAL ANIMATION FUNCTIONALITY
  const runCommit = useCallback(
    async (
      routeInfo: RouteInfo,
      enteringEl: HTMLElement,
      leavingEl?: HTMLElement
    ) => {
      console.log(`💒 runCommit: ${routeInfo.pathname}`, {
        enteringEl,
        leavingEl,
      });
      enteringEl.classList.add('ion-page');
      enteringEl.classList.add('ion-page-invisible');

      routeManagerContext.getChildrenToRender(
        stackIdRef.current,
        ionCoreOutletRef.current as never,
        routeInfo,
        () => undefined
      );

      const direction =
        routeInfo.routeDirection === 'none' ||
        routeInfo.routeDirection === 'root'
          ? undefined
          : routeInfo.routeDirection;

      if (!ionCoreOutletRef.current) {
        console.warn(
          `🛩 ⚡️ ‼️ transitionPage : NO ROUTER OUTLET : Cannot transition`
        );
        return;
      }

      await ionCoreOutletRef.current.commit(enteringEl, leavingEl, {
        deepWait: true,
        duration: direction === undefined ? 0 : undefined,
        direction: direction as never,
        showGoBack: !!routeInfo.pushedByRoute,
        progressAnimation: false,
        animationBuilder: routeInfo.routeAnimation,
      });
    },
    [routeManagerContext]
  );

  const createAndAddViewItem = useCallback(
    (routeInfo: RouteInfo, element: ReactElement, page?: HTMLElement) => {
      console.log('🚸 👁‍🗨 handlePageTransition: createViewItem', element);
      const enteringViewItem = routeManagerContext.createViewItem(
        stackIdRef.current,
        element,
        routeInfo,
        page
      );
      console.log('🚸 👁‍🗨 handlePageTransition: addViewItem', enteringViewItem);
      routeManagerContext.addViewItem(enteringViewItem);
      return enteringViewItem;
    },
    [routeManagerContext]
  );

  const transitionPage = useCallback(
    async (
      routeInfo: RouteInfo,
      enteringViewItem: ViewItem,
      leavingViewItem?: ViewItem
    ) => {
      console.log(`🛩 ⚡️ transitionPage : START : ${routeInfo.pathname}`, {
        routeInfo,
        enteringViewItem,
        leavingViewItem,
      });

      if (!ionCoreOutletRef.current) {
        console.warn(
          `🛩 💣  transitionPage : NO ROUTER OUTLET : Cannot transition`
        );
        return;
      }

      if (enteringViewItem && enteringViewItem.ionPageElement) {
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
          // Clone the match and add it to the ionCoreOutlet
          if (match) {
            const newLeavingElement = clonePageElement(
              leavingViewItem.ionPageElement.outerHTML
            );
            if (newLeavingElement) {
              ionCoreOutletRef.current.appendChild(newLeavingElement);
              await runCommit(
                routeInfo,
                enteringViewItem.ionPageElement,
                newLeavingElement
              );
              ionCoreOutletRef.current.removeChild(newLeavingElement);
            }
          }
          // If not found, run the commit as if there was no leaving view item.
          else {
            await runCommit(
              routeInfo,
              enteringViewItem.ionPageElement,
              undefined
            );
          }
        }
        // Run a normal commit.
        else {
          await runCommit(
            routeInfo,
            enteringViewItem.ionPageElement,
            leavingViewItem?.ionPageElement
          );
          if (leavingViewItem && leavingViewItem.ionPageElement) {
            leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
            leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
          }
        }
      }
    },
    [runCommit]
  );

  const handlePageTransition = useCallback(
    async (routeInfo: RouteInfo) => {
      if (!ionCoreOutletRef.current || !ionCoreOutletRef.current.commit) {
        /**
         * The route outlet has not mounted yet. We need to wait for it to render
         * before we can transition the page.
         *
         * Set a flag to indicate that we should transition the page after
         * the component has updated.
         */
        pendingPageTransitionRef.current = routeInfo;
        console.log(
          `🚸 ⏲  handlePageTransition: Pending page transition`,
          routeInfo
        );
        return;
      }

      console.log(`🚸 ⚡️ handlePageTransition : START`, routeInfo);
      // Process Page Transition
      pendingPageTransitionRef.current = null;

      // See if the entering view is already in the stack:
      let enteringViewItem = routeManagerContext.findViewItemByRouteInfo(
        routeInfo,
        stackIdRef.current
      );

      // LEARN: Old code below... isn't the entering route always the one being rendered right now?
      // const enteringRoute = matchRoute(
      //   ionRouterOutletInner?.props.children,
      //   routeInfo
      // ) as ReactElement;
      const enteringRoute = elements;
      console.log(`🚸 ⚡️ handlePageTransition : enteringRoute`, enteringRoute);

      // If found, takes the entering route and add the reference to the view item
      if (enteringViewItem) {
        console.log(
          '🚸 🔮 handlePageTransition: setting enteringViewItem.reactElement',
          enteringViewItem
        );
        enteringViewItem.reactElement = enteringRoute;
      } else if (enteringRoute) {
        enteringViewItem = createAndAddViewItem(routeInfo, enteringRoute);
      }

      // Get the leaving view item if it exists
      // TODO: Can all this be replaced by using the previous element from useOutlet() ?
      let leavingViewItem = routeManagerContext.findLeavingViewItemByRouteInfo(
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

      if (leavingViewItem && !enteringViewItem) {
        // If we have a leavingView but no entering view/route, we are probably leaving to
        // another outlet, so hide this leavingView. We do it in a timeout to give time for a
        // transition to finish.
        // setTimeout(() => {
        if (leavingViewItem.ionPageElement) {
          leavingViewItem.ionPageElement.classList.add('ion-page-hidden');
          leavingViewItem.ionPageElement.setAttribute('aria-hidden', 'true');
        }
        // }, 250);
        return;
      }

      if (!enteringViewItem || !enteringViewItem.ionPageElement) {
        console.warn(
          `🚸 💣  handlePageTransition : NO ENTERING or LEAVING PAGE ELEMENT : Cannot transition`,
          { enteringViewItem, leavingViewItem }
        );
        return;
      }

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

      if (!leavingViewItem && routeInfo.prevRouteLastPathname) {
        /**
         * If there isn't a leaving view item, but the route info indicates
         * that the user has routed from a previous path, then we need
         * to find the leaving view item to transition between.
         */
        leavingViewItem = routeManagerContext.findViewItemByPathname(
          routeInfo.prevRouteLastPathname,
          stackIdRef.current
        );
      }

      if (
        /**
         * If the entering view is already visible and the leaving view is not, the transition does not need to occur.
         */
        isViewVisible(enteringViewItem.ionPageElement) &&
        leavingViewItem !== undefined &&
        !isViewVisible(leavingViewItem?.ionPageElement) // Typescript forcing casting, not using leavingViewItem !== undefined
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
    },

    [elements, routeManagerContext, transitionPage, createAndAddViewItem]
  );

  const setIonCoreOutlet = (node: HTMLIonRouterOutletElement) => {
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
        return routeManagerContext.canGoBack();
      } else {
        return false;
      }
    };
    const onStart = () => {
      routeManagerContext.goBack();
    };
    node.swipeHandler = {
      canStart,
      onStart,
      onEnd: (_shouldContinue) => true,
    };
    // Assign reference and handle any pending transitions
    ionCoreOutletRef.current = node;
    if (pendingPageTransitionRef.current) {
      handlePageTransition({ ...pendingPageTransitionRef.current });
    }
  };

  // Methods used by IonPage via PageManager & OutletPageManger
  const stackContextValue: StackContextState = useMemo(
    () => ({
      registerIonPage: (page: HTMLElement, routeInfo: RouteInfo) => {
        console.log(`👀 registerIonPage`, {
          page,
          routeInfo,
        });
        let foundView = routeManagerContext.findViewItemByRouteInfo(
          routeInfo,
          stackIdRef.current
        );
        if (foundView) {
          console.log(`👀 <<< FOUND VIEW registerIonPage`, { page, routeInfo });
        } else {
          console.log(`👀 <<< CREATING VIEW registerIonPage`, {
            page,
            routeInfo,
          });
          foundView = createAndAddViewItem(routeInfo, elements);
        }
        foundView.ionPageElement = page;
        foundView.ionRoute = true;
        // When a new page is added, assume we want to animate to it
        handlePageTransition(routeInfo);
      },
      isInOutlet: () => true,
    }),
    [elements, createAndAddViewItem, handlePageTransition, routeManagerContext]
  );

  console.log(
    `Rendering Outlet Elements ${routeInfo.id}:${stackIdRef.current}:::`,
    { elements }
  );
  // LEARN: This clones the single child of children then assigns a reference locally
  const ionRouterOutletInner = useMemo(
    () => Children.only(children) as ReactElement,
    [children]
  );
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
}

function isViewVisible(el?: HTMLElement) {
  if (!el) return false;
  return (
    !el.classList.contains('ion-page-invisible') &&
    !el.classList.contains('ion-page-hidden')
  );
}
