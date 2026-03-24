"use client";

import { useState, useMemo, useEffect } from "react";
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
  TourGuidesScreen,
  GuideDetailScreen,
  GuideHubScreen,
  GuideBookingsScreen,
  GuideStoriesScreen,
} from "@/components/screens";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { GlobalSettingsProvider } from "@/context/GlobalSettingsContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AppModeProvider, useAppMode } from "@/context/AppModeContext";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const SIDEBAR_SCREENS = [
  "screen-home", "screen-detail", "screen-trips", "screen-wishlist",
  "screen-profile", "screen-community", "screen-notif", "screen-settings",
  "screen-quests", "screen-explore", "screen-tour-guides", "screen-guide-detail", "screen-guide-hub",
  "screen-guide-bookings", "screen-guide-stories",
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
  "screen-tour-guides": "tour-guides",
  "screen-guide-detail": "tour-guides",
  "screen-guide-bookings": "guide-incoming",
  "screen-guide-stories": "guide-stories",
};

function resolveSidebarActive(activeScreen, screenParams) {
  if (activeScreen === "screen-guide-hub") {
    const tab = screenParams.guideHubTab || "profile";
    if (tab === "incoming") return "guide-incoming";
    if (tab === "outgoing") return "guide-outgoing";
    return "guide-dashboard";
  }
  return SCREEN_TO_ACTIVE_ITEM[activeScreen] || "home";
}

function HomeInner() {
  const [activeScreen, setActiveScreen] = useState("screen-splash");
  const [screenParams, setScreenParams] = useState({});
  const { user } = useAuth();
  const { setMode, isGuideMode } = useAppMode();

  const displayName = useMemo(
    () => user?.displayName || user?.email?.split("@")[0] || "traveler",
    [user]
  );

  useEffect(() => {
    // Universal Link support for Guide Profiles (useful for Admin Preview)
    const params = new URLSearchParams(window.location.search);
    const gId = params.get("guideId");
    if (gId) {
      setActiveScreen("screen-guide-detail");
      setScreenParams({ guideId: gId });
      // Clean up the URL without reloading
      const url = new URL(window.location);
      url.searchParams.delete("guideId");
      window.history.replaceState({}, "", url);
    }
  }, []);

  const showScreen = (screenId, params) => {
    if (typeof screenId === "object" && screenId !== null) {
      try {
        sessionStorage.setItem("ride_lanka_detail_place", JSON.stringify(screenId));
      } catch (_) {
        /* ignore */
      }
      setActiveScreen("screen-detail");
      setScreenParams({});
      window.scrollTo(0, 0);
      return;
    }
    setActiveScreen(screenId);
    setScreenParams(params && typeof params === "object" ? params : {});
    window.scrollTo(0, 0);
  };

  const afterAuthSuccess = () => {
    showScreen(isGuideMode ? "screen-guide-hub" : "screen-home");
  };

  const hasSidebar = typeof activeScreen === "string" && SIDEBAR_SCREENS.includes(activeScreen);

  const sidebarActive = resolveSidebarActive(activeScreen, screenParams);
  const sidebarUserRole = isGuideMode ? "Tour guide" : "Trip planner for Sri Lanka";

  return (
    <div className="app">
      <SplashScreen
        active={activeScreen === "screen-splash"}
        onGetStarted={() => {
          setMode("traveler");
          showScreen("screen-auth");
        }}
        onSignIn={() => {
          setMode("traveler");
          showScreen("screen-auth");
        }}
        onGuideSignIn={() => {
          setMode("guide");
          showScreen("screen-auth");
        }}
      />
      <AuthScreen
        active={activeScreen === "screen-auth"}
        guideIntent={isGuideMode}
        onSignIn={afterAuthSuccess}
        onSignUp={afterAuthSuccess}
        onBack={() => showScreen("screen-splash")}
      />

      <div className={`main-layout persistent-layout ${hasSidebar ? "layout-visible" : ""}`}>
        <Sidebar
          activeItem={sidebarActive}
          userName={displayName}
          userRole={sidebarUserRole}
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
          <TourGuidesScreen active={activeScreen === "screen-tour-guides"} showScreen={showScreen} />
          <GuideDetailScreen
            active={activeScreen === "screen-guide-detail"}
            showScreen={showScreen}
            guideId={screenParams.guideId}
          />
          <GuideHubScreen
            active={activeScreen === "screen-guide-hub"}
            showScreen={showScreen}
            initialTab={["incoming", "outgoing", "profile"].includes(screenParams.guideHubTab) ? screenParams.guideHubTab : "profile"}
          />
          <GuideBookingsScreen
            active={activeScreen === "screen-guide-bookings"}
            showScreen={showScreen}
          />
          <GuideStoriesScreen
            active={activeScreen === "screen-guide-stories"}
            showScreen={showScreen}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <GlobalSettingsProvider>
      <MaintenanceGuard>
        <SettingsProvider>
          <AppModeProvider>
            <WishlistProvider>
              <HomeInner />
            </WishlistProvider>
          </AppModeProvider>
        </SettingsProvider>
      </MaintenanceGuard>
    </GlobalSettingsProvider>
  );
}
