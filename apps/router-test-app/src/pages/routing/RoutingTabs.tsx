import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { ellipse, square, triangle } from 'ionicons/icons';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TabsProps {}

const RoutingTabs: React.FC<TabsProps> = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="tabs">
        {/* <Route path="/routing/tabs" element={() => <Route element={() => <Navigate to="/tabs/home" />} />} /> */}
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

export default RoutingTabs;
