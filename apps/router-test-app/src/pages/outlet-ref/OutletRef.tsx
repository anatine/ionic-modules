import React, { useRef, useEffect } from 'react';
import {
  IonRouterOutlet,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/react';
import { Route } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OutletRefProps {}

export const OutletRef: React.FC<OutletRefProps> = () => {
  const ref = useRef<HTMLIonRouterOutletElement>(null);

  useEffect(() => {
    console.log(ref);
  }, []);

  return <IonRouterOutlet id="main-outlet" ref={ref}></IonRouterOutlet>;
};

const Main: React.FC<{ outletId?: string }> = ({ outletId }) => {
  return (
    <IonPage data-pageid="main">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Main</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>{outletId}</div>
      </IonContent>
    </IonPage>
  );
};
