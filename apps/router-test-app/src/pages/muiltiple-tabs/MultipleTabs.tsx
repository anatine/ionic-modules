import React from 'react';
import {
  IonSplitPane,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonPage,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import { Navigate, Route } from 'react-router';
import { Menu } from './Menu';
import { triangle, ellipse, square, rocket } from 'ionicons/icons';

const MultipleTabs: React.FC = () => {
  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main" />
    </IonSplitPane>
  );
};

export default MultipleTabs;

export const Tab1: React.FC = () => {
  return (
    <IonTabs>
      <IonTabBar slot="bottom">
        <IonTabButton tab="pagea" href="/multiple-tabs/tab1/pagea">
          <IonIcon icon={triangle} />
          <IonLabel>Page A</IonLabel>
        </IonTabButton>

        <IonTabButton tab="pageb" href="/multiple-tabs/tab1/pageb">
          <IonIcon icon={ellipse} />
          <IonLabel>Page B</IonLabel>
        </IonTabButton>
      </IonTabBar>
      <IonRouterOutlet id="tab1" />
    </IonTabs>
  );
};

export const Tab2: React.FC = () => {
  return (
    <IonTabs>
      <IonTabBar slot="bottom">
        <IonTabButton tab="pagec" href="/multiple-tabs/tab2/pagec">
          <IonIcon icon={square} />
          <IonLabel>Page C</IonLabel>
        </IonTabButton>
        <IonTabButton tab="paged" href="/multiple-tabs/tab2/paged">
          <IonIcon icon={rocket} />
          <IonLabel>Page D</IonLabel>
        </IonTabButton>
      </IonTabBar>
      <IonRouterOutlet id="tab2" />
    </IonTabs>
  );
};

export const Page: React.FC<{ name: string }> = ({ name }) => {
  return (
    <IonPage data-pageid={name}>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonMenuButton />
            <IonTitle>{name}</IonTitle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>{name}</IonContent>
    </IonPage>
  );
};
