import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Route } from 'react-router';
import Tab1 from './Tab1';
import Details from './Details';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import { triangle, ellipse, square } from 'ionicons/icons';
import SettingsDetails from './SettingsDetails';
import { Navigate } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TabsProps {}

const Tabs: React.FC<TabsProps> = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="tabs">
        <Route path="/routing/tabs/home" element={<Tab1 />} />
        <Route path="/routing/tabs/home/details/:id" element={<Details />} />
        {/* <Route path="/routing/tabs/home/details/:id" render={(props) => {
          return <Details />
        }} exact={true} /> */}
        <Route path="/routing/tabs/settings" element={<Tab2 />} />
        <Route
          path="/routing/tabs/settings/details/:id"
          element={<SettingsDetails />}
        />
        <Route path="/routing/tabs/tab3" element={<Tab3 />} />
        <Route
          path="/routing/tabs"
          element={<Navigate to="/routing/tabs/home" />}
        />
        <Route
          path="/routing/tabs/redirect"
          element={<Navigate to="/routing/tabs/settings" />}
        />
        {/* <Route path="/routing/tabs" render={() => <Route render={() => <Redirect to="/tabs/home" />} />} /> */}
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          tab="home"
          href="/routing/tabs/home"
          routerOptions={{ unmount: true }}
        >
          <IonIcon icon={triangle} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/routing/tabs/settings">
          <IonIcon icon={ellipse} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/routing/tabs/tab3">
          <IonIcon icon={square} />
          <IonLabel>Tab 3</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
