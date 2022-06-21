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
  IonSplitPane,
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

// Routing libs
import { IonNavigationContext } from '@anatine/ionic-react-router';
import {
  DataBrowserRouter,
  Navigate,
  Route,
  useLocation,
} from 'react-router-dom';

// Pages
import Main from '../pages/Main';
import MultipleTabs, {
  Page,
  Tab1,
  Tab2,
} from '../pages/muiltiple-tabs/MultipleTabs';
import {
  NestedOutletFirstPage,
  NestedOutletPage,
  NestedOutletSecondPage,
} from '../pages/nested-outlet/NestedOutlet';
import Refs, { RefsClass, RefsFC } from '../pages/refs/Refs';
import Favorites from '../pages/routing/Favorites';
import Menu from '../pages/routing/Menu';
import OtherPage from '../pages/routing/OtherPage';
import PropsTest, { InnerPropsTest } from '../pages/routing/PropsTest';
import RedirectRouting from '../pages/routing/RedirectRouting';
import RoutingTabs from '../pages/routing/RoutingTabs';
import ReplaceAction, {
  ReplaceActionPage1,
  ReplaceActionPage2,
  ReplaceActionPage3,
} from '../pages/replace-action/Replace';
import {
  SwipeToGoBackMain,
  SwipeToGoBackDetails,
  SwipeToGoBack,
} from '../pages/swipe-to-go-back/SwipToGoBack';
import TabsContext, {
  TabsContextTab1,
  TabsContextTab2,
} from '../pages/tab-context/TabContext';
import Tabs, { TabsTab1, TabsTab1Child1, TabsTab2 } from '../pages/tabs/Tabs';
import Details from '../pages/routing/Details';
import SettingsDetails from '../pages/routing/SettingsDetails';
import TabsSecondary, {
  TabsSecondaryTab1,
  TabsSecondaryTab2,
} from '../pages/tabs/TabsSecondary';
import RoutingTab1 from '../pages/routing/RoutingTab1';
import RoutingTab2 from '../pages/routing/RoutingTab2';
import RoutingTab3 from '../pages/routing/RoutingTab3';

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
        <Route path="/*" element={<Main />} />
        <Route
          path="/routing/*"
          element={
            <IonSplitPane contentId="main">
              <Menu />
              <IonRouterOutlet id="main" />
            </IonSplitPane>
          }
        >
          <Route path="*" element={<Navigate to="/routing/tabs/home" />} />
          <Route path="tabs/*" element={<RoutingTabs />}>
            <Route path="*" element={<Navigate to="/routing/tabs/home" />} />
            <Route path="home/*" element={<RoutingTab1 />} />
            <Route path="home/details/:id/*" element={<Details />} />

            <Route path="settings/*" element={<RoutingTab2 />} />
            <Route path="details/:id/*" element={<SettingsDetails />} />
            <Route path="tab3" element={<RoutingTab3 />} />
            <Route
              path="Navigate/*"
              element={<Navigate to="/routing/tabs/settings" />}
            />
          </Route>
          <Route path="favorites" element={<Favorites />} />
          <Route path="otherpage" element={<OtherPage />} />
          <Route path="propstest" element={<PropsTest />}>
            <Route
              path="*"
              element={
                <InnerPropsTest
                  count={0}
                  setCount={() =>
                    console.log(`Passing props has to be different`)
                  }
                />
              }
            />
          </Route>
          <Route path="redirect" element={<Navigate to="/routing/tabs" />} />
          <Route path="redirect-routing" element={<RedirectRouting />} />
        </Route>
        <Route
          path="/dynamic-routes/*"
          element={
            <div id="DynamicRoutes-route">
              <h1>DynamicRoutes</h1>
              <p>Routes would need to have state at top level now</p>
            </div>
          }
        />
        <Route path="/multiple-tabs/*" element={<MultipleTabs />}>
          <Route path="*" element={<Navigate to="/multiple-tabs/tab1" />} />
          <Route path="tab1" element={<Tab1 />}>
            <Route path="*" element={<Navigate to="pagea" />} />
            <Route path="pagea/*" element={<Page name="PageA" />} />
            <Route path="pageb/*" element={<Page name="PageB" />} />
          </Route>
          <Route path="tab2" element={<Tab2 />}>
            <Route path="*" element={<Navigate to="pagec" />} />
            <Route path="pagec/*" element={<Page name="PageC" />} />
            <Route path="paged/*" element={<Page name="PageD" />} />
          </Route>
        </Route>
        <Route
          path="/dynamic-tabs/*"
          element={
            <div id="DynamicTabs-route">
              <h1>DynamicTabs</h1>
            </div>
          }
        />
        <Route
          path="/nested-outlet/*"
          element={
            <div id="NestedOutlet-route">
              <h1>NestedOutlet</h1>
            </div>
          }
        >
          <Route path="*" element={<NestedOutletFirstPage />} />
          <Route path="secondpage" element={<NestedOutletSecondPage />}>
            <Route
              path="*"
              element={<Navigate to="/nested-outlet/secondpage/page" />}
            />
            <Route path="page/*" element={<NestedOutletPage />} />
          </Route>
        </Route>
        <Route
          path="/nested-outlet2/*"
          element={
            <div id="NestedOutlet2-route">
              <h1>NestedOutlet2</h1>
            </div>
          }
        />
        <Route path="/replace-action/*" element={<ReplaceAction />}>
          <Route path="page1/*" element={<ReplaceActionPage1 />} />
          <Route path="page2/*" element={<ReplaceActionPage2 />} />
          <Route path="page3/*" element={<ReplaceActionPage3 />} />
          <Route path="*" element={<Navigate to="/replace-action/page1" />} />
        </Route>
        <Route path="/tab-context/*" element={<TabsContext />}>
          <Route path="tab1/*" element={<TabsContextTab1 />} />
          <Route path="tab2/*" element={<TabsContextTab2 />} />
          <Route path="*" element={<Navigate to="/tab-context/tab1" />} />
        </Route>
        <Route
          path="/outlet-ref/*"
          element={
            <div id="OutletRef-route">
              <h1>OutletRef</h1>
              <p>Reference in routes will have to be at routing level</p>
            </div>
          }
        />
        <Route path="/swipe-to-go-back/*" element={<SwipeToGoBack />}>
          <Route path="*" element={<SwipeToGoBackMain />} />
          <Route path="details" element={<SwipeToGoBackDetails />} />
        </Route>
        <Route
          path="/dynamic-ionpage-classnames/*"
          element={
            <div id="DynamicIonpageClassnames-route">
              <h1>DynamicIonpageClassnames</h1>
            </div>
          }
        />
        <Route path="/tabs/*" element={<Tabs />}>
          <Route path="tab1/*" element={<TabsTab1 />} />
          <Route path="tab2/*" element={<TabsTab2 />} />
          <Route path="tab1/child/*" element={<TabsTab1Child1 />} />
          <Route path="*" element={<Navigate to="/tabs/tab1" />} />
        </Route>
        <Route path="/tabs-secondary/*" element={<TabsSecondary />}>
          <Route path="tab1/*" element={<TabsSecondaryTab1 />} />
          <Route path="tab2/*" element={<TabsSecondaryTab2 />} />
          <Route path="*" element={<Navigate to="/tabs-secondary/tab1" />} />
        </Route>
        <Route path="/refs/*" element={<Refs />}>
          <Route path="*" element={<RefsFC />} />
          <Route path="class/*" element={<RefsClass />} />
        </Route>
      </Route>
    </DataBrowserRouter>
  );

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
