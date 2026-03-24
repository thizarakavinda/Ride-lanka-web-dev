"use client";

import { useGlobalSettings } from "@/context/GlobalSettingsContext";

export default function MaintenanceGuard({ children }) {
    const { flags, loading } = useGlobalSettings();

    if (loading) return null;

    if (flags.maintenanceMode) {
        return (
            <div className="maintenance-overlay">
                <style jsx>{`
                    .maintenance-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: #0f172a;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 99999;
                        padding: 20px;
                        text-align: center;
                        color: white;
                        font-family: 'DM Sans', sans-serif;
                    }
                    .maintenance-card {
                        background: rgba(30, 41, 59, 0.7);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 24px;
                        max-width: 500px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .icon {
                        font-size: 64px;
                        margin-bottom: 24px;
                    }
                    h1 {
                        font-family: 'Playfair Display', serif;
                        font-size: 32px;
                        margin-bottom: 16px;
                        background: linear-gradient(to right, #5eead4, #2dd4bf);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    p {
                        color: #94a3b8;
                        line-height: 1.6;
                        margin-bottom: 32px;
                    }
                    .status-badge {
                        background: rgba(234, 179, 8, 0.1);
                        color: #eab308;
                        padding: 6px 16px;
                        border-radius: 100px;
                        font-size: 14px;
                        font-weight: 600;
                        border: 1px solid rgba(234, 179, 8, 0.2);
                    }
                `}</style>
                <div className="maintenance-card">
                    <div className="icon">🏗️</div>
                    <span className="status-badge">SYSTEM MAINTENANCE</span>
                    <h1>Coming Back Soon</h1>
                    <p>
                        We're currently performing some scheduled maintenance to improve your Ride Lanka experience. 
                        We'll be back online shortly. Thank you for your patience!
                    </p>
                    <div style={{ color: "#475569", fontSize: "12px" }}>
                        Ride Lanka Admin Engine v2.4.0
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
