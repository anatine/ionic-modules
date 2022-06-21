import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTabsContext,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { square, triangle } from 'ionicons/icons';
import React, { useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TabsContextProps {}

export const TabsContext: React.FC<TabsContextProps> = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="tabs"></IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          tab="tab1"
          href="/tab-context/tab1"
          routerOptions={{ unmount: true }}
        >
          <IonIcon icon={triangle} />
          <IonLabel>Tab1</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tab-context/tab2">
          <IonIcon icon={square} />
          <IonLabel>Tab2</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export const TabsContextTab1 = () => {
  const tabContext = useContext(IonTabsContext);

  return (
    <IonPage id="home" data-pageid="tab1">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Tab1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>Page: {tabContext.activeTab}</div>
        <IonButton onClick={() => tabContext.selectTab('tab2')}>
          Go to tab2
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export const TabsContextTab2 = () => {
  const tabContext = useContext(IonTabsContext);

  return (
    <IonPage id="home" data-pageid="tab2">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Tab2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>Page: {tabContext.activeTab}</div>
        <IonButton onClick={() => tabContext.selectTab('tab1')}>
          Go to tab1
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TabsContext;
