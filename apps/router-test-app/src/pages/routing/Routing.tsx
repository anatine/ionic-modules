import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import React from 'react';
import Menu from './Menu';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RoutingProps {}

const Routing: React.FC<RoutingProps> = () => {
  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main" />
    </IonSplitPane>
  );
};

export default Routing;
