# @anatine/ionic-react-router

## Description

An effort to get React Router v6 working with the [Ionic Framework](https://ionicframework.com/docs/react/navigation)

### Background

The goal of this project is to utilize the most of the React-Router v6 patterns with as minimal abstraction as possible.

`<IonRouterOutlet>` is part of the base `@ionic/react` package creating tight coupling. Internally it wraps all the routes in a component called `<StackManager>`.

In this lib, `<StackManager>` provides the same functionality and is passed to the `<IonRouteOutlet>` elements via `<IonNavigationContext>` and within the `<StackManager>` is an _outlet_ from `react-router-dom`

### STATUS

This is not production ready yet.

It might be that the current `@ionic/react-router` only renders one outlet at a time where at this is following React Router v6 patterns where a nested outlet will render as well as the parent outlet.

---

## Installation

```shell
npm install @anatine/ionic-react-router
```

## Usage

```tsx
import {
  IonPage,
} from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Routing libs
import { IonNavigationContext } from '@anatine/ionic-react-router';
import {
  DataBrowserRouter,
  Navigate,
  Route,
  useLocation,
} from 'react-router-dom';

setupIonicReact({
  mode: 'ios', // or 'md' or undefined
});

export function App() {

  return(
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
        <Route path="/*" element={<IonPage><h1>Main Page with Navigation</h1></IonPage>} />
        <Route path="/profile/*" element={<IonPage><h1>Profile</h1></IonPage>} />
        <Route path="/profile/details" element={<IonPage><h1>Profile Details</h1></IonPage>} />
      </Route>
    </DataBrowserRouter>
  )

}

```
