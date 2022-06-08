import React from 'react';
import {
  IonContent,
  IonPage,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/react';
import Menu from './Menu';
import { Route } from 'react-router';
import Tabs from './Tabs';
import Favorites from './Favorites';
import OtherPage from './OtherPage';
import PropsTest from './PropsTest';
import RedirectRouting from './RedirectRouting';
import { Navigate } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RoutingProps {}

const Routing: React.FC<RoutingProps> = () => {
  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main">
        <Route path="/routing/tabs" element={<Tabs />} />
        {/* <Route path="/routing/tabs" component={Tabs} /> */}
        <Route path="/routing/" element={<Navigate to="/routing/tabs" />} />
        <Route path="/routing/favorites" element={<Favorites />} />
        {/* <Route path="/routing/favorites" render={() => {
        return (
          <IonRouterOutlet id="favorites">
            <Route path="/routing/favorites" component={Favorites} />
          </IonRouterOutlet>
        );
      }} /> */}
        {/* <Route path="/routing/otherpage" render={() => {
        return (
          <IonRouterOutlet id="otherpage">
            <Route path="/routing/otherpage" component={OtherPage} />
          </IonRouterOutlet>
        );
      }} /> */}
        <Route path="/routing/otherpage" element={<OtherPage />} />
        <Route path="/routing/propstest" element={<PropsTest />} />
        <Route
          path="/routing/redirect"
          element={<Navigate to="/routing/tabs" />}
        />
        <Route path="/routing/redirect-routing" element={<RedirectRouting />} />
        <Route
          element={
            <IonPage data-pageid="not-found">
              <IonContent>
                <div>Not found</div>
              </IonContent>
            </IonPage>
          }
        />
        {/* <Route render={() => <Redirect to="/tabs" />} /> */}
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default Routing;
