import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewDidLeave,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import React from 'react';

export const HomePage: React.FC = () => {
  useIonViewDidEnter(() => {
    console.log('ionViewDidEnter event fired');
  });

  useIonViewDidLeave(() => {
    console.log('ionViewDidLeave event fired');
  });

  useIonViewWillEnter(() => {
    console.log('ionViewWillEnter event fired');
  });

  useIonViewWillLeave(() => {
    console.log('ionViewWillLeave event fired');
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
};

export default HomePage;
