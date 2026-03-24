"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSystemSettings } from "@/lib/api";

const GlobalSettingsContext = createContext();

export function GlobalSettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        flags: {
            aiPlannerV2: true,
            realtimeWeather: false,
            communityEvents: true,
            maintenanceMode: false,
        },
        apiKeys: {},
        loading: true,
    });

    const refreshSettings = async () => {
        try {
            // Using "dev-admin-token" for initial load to show it works
            // In a real app, this would be a public endpoint or use the current user's token
            const data = await getSystemSettings("dev-admin-token");
            setSettings({
                flags: data.flags || {},
                apiKeys: data.apiKeys || {},
                loading: false,
            });
        } catch (err) {
            console.error("[GlobalSettings] Load failed:", err);
            setSettings(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        refreshSettings();
        
        // Optional: Poll for changes every 60 seconds
        const interval = setInterval(refreshSettings, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <GlobalSettingsContext.Provider value={{ ...settings, refreshSettings }}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}

export function useGlobalSettings() {
    const context = useContext(GlobalSettingsContext);
    if (!context) throw new Error("useGlobalSettings must be used within GlobalSettingsProvider");
    return context;
}
