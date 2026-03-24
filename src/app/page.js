"use client";

import { useState, useMemo } from "react";
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
  ExploreScreen,
} from "@/components/screens";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import { WishlistProvider } from "@/context/WishlistContext";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const SIDEBAR_SCREENS = [
  "screen-home", "screen-detail", "screen-trips", "screen-wishlist",
  "screen-profile", "screen-community", "screen-notif", "screen-settings",
  "screen-quests", "screen-explore",
];

const SCREEN_TO_ACTIVE_ITEM = {
  "screen-home": "home",
  "screen-explore": "explore",
  "screen-trips": "trips",
  "screen-wishlist": "wishlist",
  "screen-profile": "profile",
  "screen-community": "community",
  "screen-notif": "notif",
  "screen-settings": "settings",
  "screen-quests": "quests",
  "screen-detail": "home",
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState("screen-splash");
  const { user } = useAuth();
  const displayName = useMemo(
    () => user?.displayName || user?.email?.split("@")[0] || "traveler",
    [user]
  );

  const showScreen = (screenId) => {
    setActiveScreen(screenId);
    window.scrollTo(0, 0);
  };

  const hasSidebar = SIDEBAR_SCREENS.includes(activeScreen);

  return (
    <GlobalSettingsProvider>
      <MaintenanceGuard>
        <SettingsProvider>
          <WishlistProvider>
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

              {/* Persistent layout with ONE sidebar for all app screens */}
              <div className={`main-layout persistent-layout ${hasSidebar ? "layout-visible" : ""}`}>
                <Sidebar
                  activeItem={SCREEN_TO_ACTIVE_ITEM[activeScreen] || "home"}
                  userName={displayName}
                  userRole="Trip planner for Sri Lanka"
                  onNavigate={showScreen}
                />
                <div className="persistent-content">
                  <HomeScreen active={activeScreen === "screen-home"} showScreen={showScreen} />
                  <DetailScreen active={activeScreen === "screen-detail"} showScreen={showScreen} />
                  <TripsScreen active={activeScreen === "screen-trips"} showScreen={showScreen} />
                  <WishlistScreen active={activeScreen === "screen-wishlist"} showScreen={showScreen} />
                  <ProfileScreen active={activeScreen === "screen-profile"} showScreen={showScreen} />
                  <CommunityScreen active={activeScreen === "screen-community"} showScreen={showScreen} />
                  <NotificationsScreen active={activeScreen === "screen-notif"} showScreen={showScreen} />
                  <SettingsScreen active={activeScreen === "screen-settings"} showScreen={showScreen} />
                  <QuestsScreen active={activeScreen === "screen-quests"} showScreen={showScreen} />
                  <ExploreScreen active={activeScreen === "screen-explore"} showScreen={showScreen} />
                </div>
              </div>
            </div>
          </WishlistProvider>
        </SettingsProvider>
      </MaintenanceGuard>
    </GlobalSettingsProvider>
  );
}
