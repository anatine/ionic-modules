import {
  generateId,
  getConfig,
  RouteInfo,
  StackContext,
  StackContextState,
} from '@ionic/react';
import {
  Children,
  cloneElement,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useRef,
} from 'react';
import { useOutlet } from 'react-router-dom';
import { clonePageElement } from './utils/clonePageElement';

export function StackManager({
  children,
  routeInfo,
}: PropsWithChildren<{ routeInfo: RouteInfo }>) {
  const stackIdRef = useRef<string>(generateId('stackManager'));
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

    await ionCoreOutletRef.current.commit(enteringEl, leavingEl, {
      deepWait: true,
      duration: direction === undefined ? 0 : undefined,
      direction: direction as never,
      showGoBack: !!routeInfo.pushedByRoute,
      progressAnimation: false,
      animationBuilder: routeInfo.routeAnimation,
    });
  }
}
