// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IonApp, IonContent, setupIonicReact } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import HomePage from './pages/Home';

setupIonicReact({
  mode: 'md',
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
    <IonApp>
      <HomePage />
    </IonApp>
  );
}

export default App;
