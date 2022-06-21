import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/react';
import { Route, Navigate } from 'react-router';
import { triangle, square } from 'ionicons/icons';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TabsProps {}

export const Tabs: React.FC<TabsProps> = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="tabs"></IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tabs/tab1">
          <IonIcon icon={triangle} />
          <IonLabel>Tab1</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon icon={square} />
          <IonLabel>Tab2</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export const TabsTab1 = () => {
  return (
    <IonPage data-pageid="tab1">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton routerLink="/tabs/tab1/child" id="child-one">
          Go to Tab1Child1
        </IonButton>
        <IonButton routerLink="/tabs-secondary/tab1" id="tabs-secondary">
          Go to Secondary Tabs
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export const TabsTab1Child1 = () => {
  return (
    <IonPage data-pageid="tab1child1">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Tab1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
};

export const TabsTab2 = () => {
  return (
    <IonPage data-pageid="tab2">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>Tab 2</IonContent>
    </IonPage>
  );
};

export default Tabs;
