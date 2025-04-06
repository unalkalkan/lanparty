"use client"

import React from 'react';

export type AppLayoutProps = {
  children?: React.ReactNode;
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <>
      {props.children}
    </>
  );
}
