import React, { useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Route } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RefsProps {}

const Refs: React.FC = () => {
  return (
    <IonRouterOutlet>
      {/* <Route exact path="/home" render={() => <Home update={addRoute} />} /> */}
      <Route path="/refs/*" element={<RefsFC />} />
      <Route path="/refs/class/*" element={<RefsClass />} />
    </IonRouterOutlet>
  );
};

export const RefsFC: React.FC<RefsProps> = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);
  return (
    <IonPage data-pageid="refs-fc">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Refs FC</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} className="ref-test"></IonContent>
    </IonPage>
  );
};

export class RefsClass extends React.Component {
  ref = React.createRef<HTMLIonContentElement>();
  override render() {
    return (
      <IonPage data-pageid="refs-class">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Refs Class</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent ref={this.ref} className="ref-test"></IonContent>
      </IonPage>
    );
  }
}

export default Refs;
