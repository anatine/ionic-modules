import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  withIonLifeCycle,
  IonButtons,
  IonMenuButton,
  IonButton,
} from '@ionic/react';
import './Tab3.css';

class RoutingTab1Tab3 extends React.Component {
  override componentDidMount() {
    console.log('Tab3 mount');
  }

  override componentWillUnmount() {
    console.log('Tab3 unmount');
  }

  ionViewWillEnter() {
    console.log('IVWE Tab3');
  }

  // ionViewWillLeave() {
  //   console.log('IVWL Tab3');
  // }

  // ionViewDidEnter() {
  //   console.log('IVDE Tab3');
  // }

  // ionViewDidLeave() {
  //   console.log('IVDL Tab3');
  // }

  override render() {
    return (
      <IonPage data-pageid="tab3-page">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton routerLink="/routing/otherpage">
            Go to Other Page
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }
}

export default withIonLifeCycle(RoutingTab1Tab3);
