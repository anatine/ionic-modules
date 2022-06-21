import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React from 'react';
import { Navigate, Route, useNavigate } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TopPageProps {}

const ReplaceAction: React.FC<TopPageProps> = () => {
  return <IonRouterOutlet></IonRouterOutlet>;
};

export const ReplaceActionPage1: React.FC = () => (
  <IonPage data-pageid="page1">
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
        <IonTitle>Page one</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonButton routerLink={'/replace-action/page2'}>Goto Page2</IonButton>
    </IonContent>
  </IonPage>
);

export const ReplaceActionPage2: React.FC = () => {
  const navigate = useNavigate();

  const clickButton = () => {
    navigate('/replace-action/page3', { replace: true });
  };

  return (
    <IonPage data-pageid="page2">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Page two</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton onClick={() => clickButton()}>Goto Page3</IonButton>
      </IonContent>
    </IonPage>
  );
};

export const ReplaceActionPage3: React.FC = () => {
  return (
    <IonPage data-pageid="page3">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/replace-action/page1" />
          </IonButtons>
          <IonTitle>Page three</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>Page 3</p>
      </IonContent>
    </IonPage>
  );
};

export default ReplaceAction;
