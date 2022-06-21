import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonRouterOutlet,
} from '@ionic/react';
import { Route } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PropsTestProps {}

export const PropsTest: React.FC<PropsTestProps> = () => {
  const [count, setCount] = useState(1);
  useEffect(() => {
    console.log(count);
  }, [count]);
  return <IonRouterOutlet></IonRouterOutlet>;
};

export const InnerPropsTest: React.FC<{ count: number; setCount: any }> = ({
  count,
  setCount,
}) => {
  return (
    <IonPage data-pageid="props-test">
      <IonHeader>
        <IonToolbar>
          <IonTitle>PropsTest</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div data-testid="count-label">Count: {count}</div>
        <IonButton onClick={() => setCount(count + 1)}>Increment</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PropsTest;
