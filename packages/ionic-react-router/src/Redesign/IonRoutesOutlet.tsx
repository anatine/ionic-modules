import React from 'react';
import { PropsWithChildren } from 'react';
import { Outlet, Route, Routes } from 'react-router';

export function IonRoutesOutlet({ children }: PropsWithChildren) {
  console.log(`🍻 Processing IonRoutesOutlet Children`, children);
  React.Children.forEach(children, (child) => {
    return;
  });

  return (
    <Routes>
      {children}
      <div
        style={{ padding: '8px', backgroundColor: `rgba(255, 20, 100, 10)` }}
      ></div>
    </Routes>
  );
}
