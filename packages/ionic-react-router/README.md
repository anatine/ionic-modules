# ionic-react-router

Rebuilding router for react-router v6

## Connection with core elements

### The ionic wrapper

```tsx
<IonRouterOutletInner
  setRef={(val: HTMLIonRouterOutletElement) => (this.ionRouterOutlet = val)} {...props} >
  {children}
</IonRouterOutletInner>
```

### Which is a proxy

```tsx
import { defineCustomElement as defineIonRouterOutlet } from '@ionic/core/components/ion-router-outlet.js';
import { /*@__PURE__*/ createReactComponent } from './react-component-lib';

export const IonRouterOutletInner = /*@__PURE__*/ createReactComponent<
  JSX.IonRouterOutlet & {
    setRef?: (val: HTMLIonRouterOutletElement) => void;
    forwardedRef?: React.ForwardedRef<HTMLIonRouterOutletElement>;
  },
  HTMLIonRouterOutletElement
>('ion-router-outlet', undefined, undefined, defineIonRouterOutlet);
```

### RouteInfo is used everywhere

```typescript
export interface RouteInfo<TOptions = any> {
  id: string;
  lastPathname?: string;
  prevRouteLastPathname?: string;
  routeAction?: RouteAction;
  routeDirection?: RouterDirection;
  routeAnimation?: AnimationBuilder;
  routeOptions?: TOptions;
  params?: { [key: string]: string | string[] };
  pushedByRoute?: string;
  pathname: string;
  search: string;
  tab?: string;
}
```

### NavManger is necessary

```typescript
interface NavManagerProps {
  routeInfo: RouteInfo;
  onNativeBack: () => void;
  onNavigateBack: (route?: string | RouteInfo, animationBuilder?: AnimationBuilder) => void;
  onNavigate: (
    path: string,
    action: RouteAction,
    direction?: RouterDirection,
    animationBuilder?: AnimationBuilder,
    options?: any,
    tab?: string
  ) => void;
  onSetCurrentTab: (tab: string, routeInfo: RouteInfo) => void;
  onChangeTab: (tab: string, path: string, routeOptions?: any) => void;
  onResetTab: (tab: string, path: string, routeOptions?: any) => void;
  ionRedirect: any;
  ionRoute: any;
  stackManager: any;
  locationHistory: LocationHistory;
}
```
