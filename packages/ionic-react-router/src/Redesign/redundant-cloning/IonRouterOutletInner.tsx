/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from '@ionic/core/components';
import { defineCustomElement as defineIonRouterOutlet } from '@ionic/core/components/ion-router-outlet.js';
import { createReactComponent } from './createComponent';

export const IonRouterOutletInner = /*@__PURE__*/ createReactComponent<
  JSX.IonRouterOutlet & {
    setRef?: (val: HTMLIonRouterOutletElement) => void;
    forwardedRef?: React.ForwardedRef<HTMLIonRouterOutletElement>;
  },
  HTMLIonRouterOutletElement
>('ion-router-outlet', undefined, undefined, defineIonRouterOutlet);
