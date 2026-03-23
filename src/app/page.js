"use client";

import { useState } from "react";
import {
  SplashScreen,
  AuthScreen,
  HomeScreen,
  DetailScreen,
  TripsScreen,
  WishlistScreen,
  ProfileScreen,
  CommunityScreen,
  NotificationsScreen,
  SettingsScreen,
  QuestsScreen,
} from "@/components/screens";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState("screen-splash");

  const showScreen = (screenId) => {
    setActiveScreen(screenId);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <SplashScreen
        active={activeScreen === "screen-splash"}
        onGetStarted={() => showScreen("screen-auth")}
        onSignIn={() => showScreen("screen-auth")}
      />
      <AuthScreen
        active={activeScreen === "screen-auth"}
        onSignIn={() => showScreen("screen-home")}
        onSignUp={() => showScreen("screen-home")}
      />
      <HomeScreen active={activeScreen === "screen-home"} showScreen={showScreen} />
      <DetailScreen active={activeScreen === "screen-detail"} showScreen={showScreen} />
      <TripsScreen active={activeScreen === "screen-trips"} showScreen={showScreen} />
      <WishlistScreen active={activeScreen === "screen-wishlist"} showScreen={showScreen} />
      <ProfileScreen active={activeScreen === "screen-profile"} showScreen={showScreen} />
      <CommunityScreen active={activeScreen === "screen-community"} showScreen={showScreen} />
      <NotificationsScreen active={activeScreen === "screen-notif"} showScreen={showScreen} />
      <SettingsScreen active={activeScreen === "screen-settings"} showScreen={showScreen} />
      <QuestsScreen active={activeScreen === "screen-quests"} showScreen={showScreen} />
    </div>
  );
}
