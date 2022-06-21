// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

import { IonNavigationContext } from '@anatine/ionic-react-router';
import { DataBrowserRouter, Route, useLocation } from 'react-router-dom';

setupIonicReact({
  mode: 'ios',
});

export function App() {
  // Use matchMedia to check the user preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  toggleDarkTheme(prefersDark.matches);

  // Listen for changes to the prefers-color-scheme media query
  prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));

  // Add or remove the "dark" class based on if the media query matches
  function toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  const UsersListPage: React.FC<{ id?: string }> = () => {
    const location = useLocation();
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Users {location.pathname}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/users/1">
              <IonLabel>User 1</IonLabel>
            </IonItem>
            <IonItem routerLink="/users/2">
              <IonLabel>User 2</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPage>
    );
  };

  const User1: React.FC<{ id?: string }> = () => {
    return (
      <IonPage id="user-1">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>User One</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton routerLink="/users/2">User Two</IonButton>
        </IonContent>
      </IonPage>
    );
  };

  const User2: React.FC<{ id?: string }> = () => {
    return (
      <IonPage id="user-2">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>User Two</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton routerLink="/users/1">User One</IonButton>
        </IonContent>
      </IonPage>
    );
  };

  const NewItem: React.FC = () => {
    return (
      <IonPage id="user-ion-page">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>New Item</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent></IonContent>
      </IonPage>
    );
  };

  return (
    <DataBrowserRouter
      fallbackElement={
        <div>
          <h1>MISSING</h1>
        </div>
      }
    >
      <Route
        element={
          <IonNavigationContext>
            <IonRouterOutlet />
          </IonNavigationContext>
        }
      >
        <Route
          path="/*"
          element={
            <div id="home route div">
              <h1>Home Route</h1>
            </div>
          }
        />
        <Route
          path="/messages"
          element={
            <IonPage>
              <div style={{ opacity: 0.5, color: 'darkgreen' }}>
                <h1>Dashboard Messages</h1>
              </div>
            </IonPage>
          }
        />
        <Route path="/new" element={<NewItem />} />
        <Route
          id="UsersRoute"
          path="/users/*"
          element={<UsersListPage id="ListPageElementInRoute" />}
        />
        <Route
          id="UsersRoute1"
          path="/users/1"
          element={<User1 id="RouteUser1" />}
        />
        <Route
          id="UsersRoute2"
          path="/users/2"
          element={<User2 id="RouteUser2" />}
        />
        <Route
          path="/profile/*"
          element={
            <IonPage>
              <div style={{ opacity: 0.5, color: 'blue' }}>
                <h1>Fun Profile</h1>
              </div>
              <IonRouterOutlet />
            </IonPage>
          }
        >
          <Route
            path="brian"
            element={
              <IonPage>
                <div style={{ opacity: 0.5, color: 'darkorange' }}>
                  <h1>BRIAN!</h1>
                </div>
              </IonPage>
            }
          />
        </Route>
      </Route>
    </DataBrowserRouter>
  );
}

export default App;
