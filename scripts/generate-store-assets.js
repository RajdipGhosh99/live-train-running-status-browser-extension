#!/usr/bin/env node
/**
 * Chrome Web Store & Microsoft Edge Add-ons Promotional Assets Generator
 * Generates MakeMyTrip screenshots (1280x800), Small Promo Tile (440x280), and Marquee Promo Tile (1400x560).
 * Produces both high-quality JPEG and 24-bit RGB PNG (no alpha channel).
 * Created by Rajdip Ghosh (https://github.com/RajdipGhosh99).
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'store-assets');
const ARTIFACTS_DIR = '/Users/rajdip/.gemini/antigravity/brain/35f307b3-b767-4c12-95c6-6986c4aa6066/store-assets';
const ICON_BASE64 = fs.readFileSync(path.join(ROOT_DIR, 'public/icons/icon512.png')).toString('base64');
const ICON_DATA_URL = `data:image/png;base64,${ICON_BASE64}`;

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// Shared MakeMyTrip base layout
function getMmtBaseHtml({ titleBanner, subBanner, activeNav = 'Trains', mainContent, overlayContent = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MakeMyTrip - Live Train Delay Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
      background: #f2f5f8;
      color: #1a1a1a;
      overflow: hidden;
      width: 1280px;
      height: 800px;
    }

    /* Top Extension Feature Banner */
    .ext-feature-banner {
      height: 60px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-bottom: 2px solid #2563eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      color: #ffffff;
      z-index: 1000;
      position: relative;
    }
    .ext-banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ext-banner-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .ext-banner-text h1 {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #ffffff;
      line-height: 1.2;
    }
    .ext-banner-text p {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 1px;
    }
    .ext-banner-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ext-badge-pill {
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.5);
      color: #93c5fd;
      font-size: 10.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .ext-badge-dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }

    /* MakeMyTrip Top Navigation Bar */
    .mmt-navbar {
      height: 52px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
    }
    .mmt-logo-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .mmt-logo {
      display: flex;
      align-items: center;
      font-weight: 900;
      font-size: 20px;
      color: #000000;
      letter-spacing: -0.5px;
    }
    .mmt-logo span.red { color: #eb2026; }
    .mmt-logo span.blue { color: #0084ff; }
    .mmt-nav-tabs {
      display: flex;
      align-items: center;
      gap: 24px;
      height: 52px;
    }
    .mmt-nav-tab {
      font-size: 12.5px;
      font-weight: 600;
      color: #4b5563;
      display: flex;
      align-items: center;
      gap: 6px;
      height: 100%;
      padding: 0 4px;
      border-bottom: 3px solid transparent;
      cursor: pointer;
    }
    .mmt-nav-tab.active {
      color: #0084ff;
      border-bottom-color: #0084ff;
      font-weight: 700;
    }
    .mmt-user-action {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
    }
    .mmt-login-btn {
      background: linear-gradient(90deg, #53b2fe, #065af3);
      color: #ffffff;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
    }

    /* MakeMyTrip Search Criteria Strip */
    .mmt-search-strip {
      background: #051329;
      color: #ffffff;
      padding: 10px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .mmt-search-item {
      display: flex;
      flex-direction: column;
    }
    .mmt-search-label {
      font-size: 9.5px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .mmt-search-val {
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mmt-search-arrow {
      color: #38bdf8;
      font-weight: bold;
    }
    .mmt-modify-btn {
      background: #e11d48;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* Results Layout */
    .mmt-container {
      display: flex;
      gap: 16px;
      padding: 14px 24px;
      height: calc(800px - 60px - 52px - 58px);
      box-sizing: border-box;
      position: relative;
    }

    /* Sidebar Filters */
    .mmt-sidebar {
      width: 230px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      padding: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      height: 100%;
      flex-shrink: 0;
    }
    .filter-header {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }
    .filter-group {
      margin-bottom: 14px;
    }
    .filter-group-title {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }
    .filter-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #475569;
      margin-bottom: 5px;
    }
    .filter-option input {
      accent-color: #0084ff;
    }

    /* Main Train Listings */
    .mmt-listings {
      flex: 1;
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .listings-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .train-count-badge {
      color: #0f172a;
      font-weight: 800;
    }

    /* MakeMyTrip Train Listing Card */
    .mmt-train-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      position: relative;
    }
    .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .train-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .train-name-text {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .train-schedule-info {
      font-size: 10.5px;
      color: #64748b;
      font-weight: 500;
    }

    /* LIVE DELAY BADGE (Extension Injected) */
    .rail-delay-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .badge-ontime {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }
    .badge-moderate {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .badge-late {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .badge-ontime .badge-dot { background: #10b981; box-shadow: 0 0 6px #10b981; }
    .badge-moderate .badge-dot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
    .badge-late .badge-dot { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

    /* Journey Times Strip */
    .journey-times-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 8px 0;
      padding-bottom: 8px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .time-station-col {
      display: flex;
      flex-direction: column;
    }
    .station-time {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
    .station-name {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }
    .station-code {
      font-size: 10px;
      color: #94a3b8;
    }
    .duration-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }
    .duration-time {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .duration-line {
      width: 140px;
      height: 2px;
      background: #cbd5e1;
      position: relative;
    }
    .duration-line::before, .duration-line::after {
      content: '';
      position: absolute;
      top: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
    }
    .duration-line::before { left: 0; }
    .duration-line::after { right: 0; }

    /* Booking Classes Row */
    .classes-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 6px;
    }
    .class-chip {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 10px;
      display: flex;
      flex-direction: column;
      min-width: 80px;
      background: #f8fafc;
    }
    .class-chip.available {
      border-color: #bbf7d0;
      background: #f0fdf4;
    }
    .class-chip.waitlist {
      border-color: #fecaca;
      background: #fef2f2;
    }
    .class-type { font-weight: 800; color: #1e293b; font-size: 10.5px; }
    .class-status { font-weight: 700; font-size: 9.5px; margin-top: 1px; }
    .class-chip.available .class-status { color: #15803d; }
    .class-chip.waitlist .class-status { color: #b91c1c; }

    /* Live Station ETA Footer on Card */
    .card-live-footer {
      margin-top: 7px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #334155;
    }
    .live-status-pill-text {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
    }

    /* FLOATING CONTROLLER HUD */
    .rail-floating-hud {
      position: absolute;
      bottom: 18px;
      right: 24px;
      width: 276px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16);
      padding: 10px 12px;
      z-index: 500;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rail-hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rail-hud-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }
    .rail-hud-version-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      background: #e2e8f0;
      color: #475569;
      border-radius: 999px;
    }
    .rail-hud-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .rail-hud-ctrl-btn {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    .rail-hud-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rail-hud-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748b;
    }
    .rail-hud-actions {
      display: flex;
      gap: 6px;
    }
    .rail-hud-fetch-btn {
      flex: 1;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 7px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }
    .rail-hud-gear-btn {
      width: 28px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334155;
    }
    .rail-hud-footer-note {
      font-size: 8.5px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.1;
    }

    /* 3-METRIC ANALYTICS POPOVER */
    .rail-analytics-popover {
      position: absolute;
      top: 32px;
      left: 0;
      width: 330px;
      background: #ffffff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(37, 99, 235, 0.15);
      z-index: 600;
      padding: 12px;
    }
    .popover-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 8px;
    }
    .popover-title-text h4 {
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .popover-title-text p {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
    }
    .popover-status-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 7px;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 8px;
    }
    .metrics-3-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 6px;
      text-align: center;
    }
    .metric-label {
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.3px;
    }
    .metric-value {
      font-size: 12.5px;
      font-weight: 800;
      margin: 2px 0 1px;
    }
    .metric-sub {
      font-size: 8.5px;
      color: #64748b;
    }
    .metric-card.today .metric-value { color: #16a34a; }
    .metric-card.trend .metric-value { color: #d97706; }
    .metric-card.punctual .metric-value { color: #2563eb; }
    .station-live-progress {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 6px 8px;
      font-size: 9.5px;
      color: #334155;
      margin-bottom: 8px;
    }
    .progress-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .popover-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #94a3b8;
    }
    .popover-refresh-btn {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    /* EXTENSION POPUP OVERLAY (Screenshot 4) */
    .extension-popup-overlay {
      position: absolute;
      top: 10px;
      right: 28px;
      width: 320px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08);
      z-index: 700;
      overflow: hidden;
    }
    .popup-header {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .popup-brand-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .popup-brand-left img {
      width: 24px;
      height: 24px;
      border-radius: 6px;
    }
    .popup-brand-title {
      font-size: 12px;
      font-weight: 800;
      line-height: 1.1;
    }
    .popup-brand-ver {
      font-size: 9px;
      color: #93c5fd;
    }
    .popup-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .popup-site-pill {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .popup-search-box {
      display: flex;
      gap: 6px;
    }
    .popup-input {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .popup-search-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
    }
    .popup-result-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
    }
    .popup-res-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .popup-res-title strong {
      font-size: 11.5px;
      color: #0f172a;
    }
    .popup-res-badge {
      font-size: 9.5px;
      font-weight: 700;
      color: #16a34a;
      background: #dcfce7;
      padding: 2px 6px;
      border-radius: 999px;
    }
    .popup-res-detail {
      font-size: 10px;
      color: #475569;
      line-height: 1.3;
    }
    .popup-chips-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .popup-chips-row {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    .popup-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 700;
      color: #334155;
    }

    /* OPTIONS DASHBOARD OVERLAY (Screenshot 5) */
    .options-preview-overlay {
      position: absolute;
      inset: 0;
      background: #f8fafc;
      z-index: 800;
      display: flex;
    }
    .opt-sidebar {
      width: 250px;
      background: #0f172a;
      color: white;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-right: 1px solid #1e293b;
    }
    .opt-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .opt-brand img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .opt-brand h3 {
      font-size: 13.5px;
      font-weight: 800;
      line-height: 1.1;
    }
    .opt-brand p {
      font-size: 10px;
      color: #94a3b8;
    }
    .opt-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .opt-nav-item {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 600;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .opt-nav-item.active {
      background: #2563eb;
      color: white;
      font-weight: 700;
    }
    .opt-memory-box {
      margin-top: auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
    }
    .opt-mem-title {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .opt-mem-bar {
      height: 6px;
      background: #334155;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .opt-mem-fill {
      width: 28%;
      height: 100%;
      background: #3b82f6;
    }
    .opt-mem-stat {
      font-size: 9.5px;
      color: #cbd5e1;
    }
    .opt-content {
      flex: 1;
      padding: 24px 32px;
      overflow-y: hidden;
    }
    .opt-header {
      margin-bottom: 16px;
    }
    .opt-header h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .opt-header p {
      font-size: 12px;
      color: #64748b;
    }
    .opt-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .opt-card-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .portal-cfg-box {
      border: 1.5px solid #2563eb;
      border-radius: 8px;
      padding: 12px 14px;
      background: #eff6ff;
      margin-bottom: 12px;
    }
    .portal-cfg-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .portal-cfg-title {
      font-size: 12px;
      font-weight: 800;
      color: #1e3a8a;
    }
    .radio-positions {
      display: flex;
      gap: 16px;
      font-size: 11px;
      color: #1e40af;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <!-- Extension Top Highlight Banner -->
  <header class="ext-feature-banner">
    <div class="ext-banner-left">
      <img src="${ICON_DATA_URL}" alt="Icon" class="ext-banner-icon" />
      <div class="ext-banner-text">
        <h1>${titleBanner}</h1>
        <p>${subBanner}</p>
      </div>
    </div>
    <div class="ext-banner-right">
      <div class="ext-badge-pill">
        <span class="ext-badge-dot"></span> Live Delay Tracker v2.0.4
      </div>
      <div class="ext-badge-pill" style="border-color: rgba(16, 185, 129, 0.5); color: #6ee7b7; background: rgba(16, 185, 129, 0.15);">
        MakeMyTrip Active
      </div>
    </div>
  </header>

  <!-- MakeMyTrip Header -->
  <nav class="mmt-navbar">
    <div class="mmt-logo-group">
      <div class="mmt-logo">
        <span class="blue">make</span><span class="red">my</span><span class="blue">trip</span>
      </div>
      <div class="mmt-nav-tabs">
        <div class="mmt-nav-tab">✈️ Flights</div>
        <div class="mmt-nav-tab">🏨 Hotels</div>
        <div class="mmt-nav-tab active">🚆 Trains</div>
        <div class="mmt-nav-tab">🚕 Cabs</div>
        <div class="mmt-nav-tab">💱 Forex</div>
      </div>
    </div>
    <div class="mmt-user-action">
      <span>₹ INR</span>
      <span>24x7 Rail Support</span>
      <button class="mmt-login-btn">My Account</button>
    </div>
  </nav>

  <!-- MakeMyTrip Search Criteria Strip -->
  <div class="mmt-search-strip">
    <div class="mmt-search-item">
      <span class="mmt-search-label">FROM</span>
      <span class="mmt-search-val">New Delhi (NDLS)</span>
    </div>
    <span class="mmt-search-arrow">➔</span>
    <div class="mmt-search-item">
      <span class="mmt-search-label">TO</span>
      <span class="mmt-search-val">Mumbai Central (MMCT)</span>
    </div>
    <div class="mmt-search-item">
      <span class="mmt-search-label">TRAVEL DATE</span>
      <span class="mmt-search-val">Tomorrow, 09 Sep 2026</span>
    </div>
    <div class="mmt-search-item">
      <span class="mmt-search-label">CLASS & QUOTA</span>
      <span class="mmt-search-val">All Classes • General</span>
    </div>
    <button class="mmt-modify-btn">Modify Search</button>
  </div>

  <!-- MakeMyTrip Main Container -->
  <div class="mmt-container">
    <!-- Sidebar Filters -->
    <aside class="mmt-sidebar">
      <div class="filter-header">Filter Trains</div>
      <div class="filter-group">
        <div class="filter-group-title">Departure Time</div>
        <label class="filter-option"><input type="checkbox" checked> 12 PM - 6 PM (Afternoon)</label>
        <label class="filter-option"><input type="checkbox" checked> 6 PM - 12 AM (Evening)</label>
      </div>
      <div class="filter-group">
        <div class="filter-group-title">Train Type</div>
        <label class="filter-option"><input type="checkbox" checked> Rajdhani / Tejas (3)</label>
        <label class="filter-option"><input type="checkbox" checked> Duronto (1)</label>
        <label class="filter-option"><input type="checkbox" checked> Superfast (12)</label>
      </div>
      <div class="filter-group">
        <div class="filter-group-title">Punctuality Score</div>
        <label class="filter-option"><input type="checkbox" checked> High (>90% On-Time)</label>
        <label class="filter-option"><input type="checkbox"> Moderate (75-90%)</label>
      </div>
    </aside>

    <!-- Listings -->
    <main class="mmt-listings">
      <div class="listings-toolbar">
        <div>Showing <span class="train-count-badge">24 Trains</span> for New Delhi ➔ Mumbai Central</div>
        <div>Sorted by: <strong>Punctuality & Departure (Earliest)</strong></div>
      </div>

      ${mainContent}
    </main>

    ${overlayContent}
  </div>
</body>
</html>`;
}

// 3 MakeMyTrip Train Cards Generator
function getMmtTrainCardsHtml({ openPopover = false }) {
  return `
    <!-- Card 1: Tejas Rajdhani Express (On Time) -->
    <div class="mmt-train-card">
      <div class="card-top-row">
        <div class="train-title-box" style="position: relative;">
          <span class="train-name-text">12952 • TEJAS RAJDHANI EXP</span>
          <!-- Live Delay Badge -->
          <span class="rail-delay-badge badge-ontime">
            <span class="badge-dot"></span>
            <span>🚆 Live: On Time (0m delay)</span>
          </span>

          ${openPopover ? `
          <!-- 3-Metric Analytics Popover -->
          <div class="rail-analytics-popover">
            <div class="popover-header">
              <div class="popover-title-text">
                <h4>12952 NDLS-MMCT TEJAS RAJDHANI</h4>
                <p>Live Punctuality Analytics • Source: National Rail Network</p>
              </div>
              <span style="font-size: 10px; color: #64748b; font-weight: 700;">v2.0.4</span>
            </div>

            <div class="popover-status-banner">
              <span class="badge-dot" style="background:#10b981;"></span>
              <span>Running On Time • Currently between Ratlam & Vadodara</span>
            </div>

            <div class="metrics-3-grid">
              <div class="metric-card today">
                <div class="metric-label">TODAY LIVE</div>
                <div class="metric-value">0m Delay</div>
                <div class="metric-sub">On Schedule</div>
              </div>
              <div class="metric-card trend">
                <div class="metric-label">4-WK TYPICAL</div>
                <div class="metric-value">+4 mins</div>
                <div class="metric-sub">Wednesdays</div>
              </div>
              <div class="metric-card punctual">
                <div class="metric-label">RELIABILITY</div>
                <div class="metric-value">98%</div>
                <div class="metric-sub">29/30 On-Time</div>
              </div>
            </div>

            <div class="station-live-progress">
              <div class="progress-row">
                <span><strong>Last Station:</strong> Ratlam Jn (PF 4)</span>
                <span style="color:#16a34a; font-weight:700;">Departed On Time</span>
              </div>
              <div class="progress-row">
                <span><strong>Next Station:</strong> Vadodara Jn (PF 1)</span>
                <span>ETA: 03:52 (On Time)</span>
              </div>
            </div>

            <div class="popover-footer-actions">
              <span>Updated 30s ago (Direct Gateway)</span>
              <button class="popover-refresh-btn">🔄 Refresh Data</button>
            </div>
          </div>
          ` : ''}
        </div>
        <span class="train-schedule-info">Runs Daily • High Punctuality Route</span>
      </div>

      <div class="journey-times-strip">
        <div class="time-station-col">
          <span class="station-time">16:55</span>
          <span class="station-name">New Delhi</span>
          <span class="station-code">NDLS</span>
        </div>
        <div class="duration-indicator">
          <span class="duration-time">15h 40m</span>
          <div class="duration-line"></div>
          <span style="font-size: 9.5px; color: #94a3b8;">5 stops</span>
        </div>
        <div class="time-station-col" style="text-align: right;">
          <span class="station-time">08:35</span>
          <span class="station-name">Mumbai Central</span>
          <span class="station-code">MMCT</span>
        </div>
      </div>

      <div class="classes-row">
        <div class="class-chip available">
          <span class="class-type">3A • AC 3 Tier</span>
          <span class="class-status">AVAILABLE - 0082</span>
        </div>
        <div class="class-chip available">
          <span class="class-type">2A • AC 2 Tier</span>
          <span class="class-status">AVAILABLE - 0038</span>
        </div>
        <div class="class-chip available">
          <span class="class-type">1A • AC First</span>
          <span class="class-status">AVAILABLE - 0012</span>
        </div>
      </div>

      <div class="card-live-footer">
        <div class="live-status-pill-text">
          <span class="badge-dot" style="background:#10b981;"></span>
          <span>Live Tracking Active: Crossed Kota Jn on time (Platform 1A)</span>
        </div>
        <span style="color: #2563eb; font-weight: 700; cursor: pointer;">View Coach Layout ➔</span>
      </div>
    </div>

    <!-- Card 2: August Kranti Tejas Rajdhani (Moderate Delay) -->
    <div class="mmt-train-card">
      <div class="card-top-row">
        <div class="train-title-box">
          <span class="train-name-text">12954 • AUGUST KRANTI TEJAS RAJ</span>
          <span class="rail-delay-badge badge-moderate">
            <span class="badge-dot"></span>
            <span>🚆 Live: +18m Late</span>
          </span>
        </div>
        <span class="train-schedule-info">Runs Daily • Fast Express</span>
      </div>

      <div class="journey-times-strip">
        <div class="time-station-col">
          <span class="station-time">17:15</span>
          <span class="station-name">H Nizamuddin</span>
          <span class="station-code">NZM</span>
        </div>
        <div class="duration-indicator">
          <span class="duration-time">16h 50m</span>
          <div class="duration-line"></div>
          <span style="font-size: 9.5px; color: #94a3b8;">7 stops</span>
        </div>
        <div class="time-station-col" style="text-align: right;">
          <span class="station-time">10:05</span>
          <span class="station-name">Mumbai Central</span>
          <span class="station-code">MMCT</span>
        </div>
      </div>

      <div class="classes-row">
        <div class="class-chip available">
          <span class="class-type">3A • AC 3 Tier</span>
          <span class="class-status">AVAILABLE - 0024</span>
        </div>
        <div class="class-chip waitlist">
          <span class="class-type">2A • AC 2 Tier</span>
          <span class="class-status">RAC 4 / WL 1</span>
        </div>
        <div class="class-chip available">
          <span class="class-type">1A • AC First</span>
          <span class="class-status">AVAILABLE - 0004</span>
        </div>
      </div>

      <div class="card-live-footer">
        <div class="live-status-pill-text">
          <span class="badge-dot" style="background:#f59e0b;"></span>
          <span>Departed Mathura Jn • 18m delay • Expected recovery by Nagda Jn</span>
        </div>
        <span style="color: #2563eb; font-weight: 700; cursor: pointer;">View Coach Layout ➔</span>
      </div>
    </div>

    <!-- Card 3: Paschim Superfast Express (Delayed) -->
    <div class="mmt-train-card">
      <div class="card-top-row">
        <div class="train-title-box">
          <span class="train-name-text">12926 • PASCHIM SUPERFAST EXP</span>
          <span class="rail-delay-badge badge-late">
            <span class="badge-dot"></span>
            <span>🚆 Live: +42m Late</span>
          </span>
        </div>
        <span class="train-schedule-info">Runs Daily • Superfast</span>
      </div>

      <div class="journey-times-strip">
        <div class="time-station-col">
          <span class="station-time">16:35</span>
          <span class="station-name">New Delhi</span>
          <span class="station-code">NDLS</span>
        </div>
        <div class="duration-indicator">
          <span class="duration-time">22h 20m</span>
          <div class="duration-line"></div>
          <span style="font-size: 9.5px; color: #94a3b8;">14 stops</span>
        </div>
        <div class="time-station-col" style="text-align: right;">
          <span class="station-time">14:55</span>
          <span class="station-name">Bandra Terminus</span>
          <span class="station-code">BDTS</span>
        </div>
      </div>

      <div class="classes-row">
        <div class="class-chip available">
          <span class="class-type">3A • AC 3 Tier</span>
          <span class="class-status">AVAILABLE - 0056</span>
        </div>
        <div class="class-chip available">
          <span class="class-type">SL • Sleeper</span>
          <span class="class-status">AVAILABLE - 0112</span>
        </div>
      </div>
    </div>
  `;
}

// Floating HUD Component HTML
function getFloatingHudHtml() {
  return `
    <div class="rail-floating-hud">
      <div class="rail-hud-header">
        <div class="rail-hud-title">
          <img src="${ICON_DATA_URL}" width="16" height="16" style="border-radius:4px;" />
          <strong>Train Delay Tracker</strong>
          <span class="rail-hud-version-badge">v2.0.4</span>
        </div>
        <div class="rail-hud-controls">
          <button class="rail-hud-ctrl-btn" title="Minimize">−</button>
          <button class="rail-hud-ctrl-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="rail-hud-body">
        <div class="rail-hud-status-row">
          <span><strong>24 trains detected</strong> on MakeMyTrip</span>
          <span style="color:#16a34a; font-weight:700;">● Active</span>
        </div>
        <div class="rail-hud-actions">
          <button class="rail-hud-fetch-btn">
            <span>⚡</span> Fetch All Delays
          </button>
          <button class="rail-hud-gear-btn" title="Open Settings">⚙</button>
        </div>
        <div class="rail-hud-footer-note">
          🛡️ Individual Non-Commercial Tool • 0.4 MB Memory
        </div>
      </div>
    </div>
  `;
}

// Extension Popup HTML
function getPopupHtml() {
  return `
    <div class="extension-popup-overlay">
      <div class="popup-header">
        <div class="popup-brand-left">
          <img src="${ICON_DATA_URL}" alt="App Icon" />
          <div>
            <div class="popup-brand-title">Train Delay Tracker</div>
            <div class="popup-brand-ver">v2.0.4 • Community Edition</div>
          </div>
        </div>
        <span style="background:#22c55e; width:8px; height:8px; border-radius:50%; box-shadow:0 0 8px #22c55e;"></span>
      </div>

      <div class="popup-body">
        <div class="popup-site-pill">
          <span>🌐 Active on: MakeMyTrip (MMT)</span>
          <span style="color:#15803d;">Auto-Track ON</span>
        </div>

        <div>
          <div class="popup-chips-label">Instant 5-Digit Train Lookup</div>
          <div class="popup-search-box">
            <input type="text" class="popup-input" value="12952" placeholder="Enter Train Number (e.g. 12952)" />
            <button class="popup-search-btn">Track</button>
          </div>
        </div>

        <div class="popup-result-card">
          <div class="popup-res-title">
            <strong>12952 • TEJAS RAJDHANI</strong>
            <span class="popup-res-badge">ON TIME (0m)</span>
          </div>
          <div class="popup-res-detail">
            <div><strong>Location:</strong> Approaching Vadodara Jn (PF 1)</div>
            <div><strong>Speed:</strong> 128 km/h • 98% Punctuality Rating</div>
            <div style="color:#64748b; font-size:9px; margin-top:2px;">Updated: Just now via Direct Rail Gateway</div>
          </div>
        </div>

        <div>
          <div class="popup-chips-label">Recent Searches</div>
          <div class="popup-chips-row">
            <span class="popup-chip">12952 Rajdhani</span>
            <span class="popup-chip">12004 Shatabdi</span>
            <span class="popup-chip">22436 Vande Bharat</span>
          </div>
        </div>

        <button style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:6px; font-size:11px; font-weight:700; color:#334155;">
          ⚙️ Open Settings & Preferences
        </button>
      </div>
    </div>
  `;
}

// Options Dashboard HTML
function getOptionsHtml() {
  return `
    <div class="options-preview-overlay">
      <aside class="opt-sidebar">
        <div class="opt-brand">
          <img src="${ICON_DATA_URL}" alt="App Icon" />
          <div>
            <h3>Train Delay Tracker</h3>
            <p>v2.0.4 • Options Hub</p>
          </div>
        </div>

        <nav class="opt-nav">
          <div class="opt-nav-item active">🌐 Supported Sites & Layout</div>
          <div class="opt-nav-item">⚡ On-Demand Fetching</div>
          <div class="opt-nav-item">🔑 Data Providers & Keys</div>
          <div class="opt-nav-item">💾 Caching & Performance</div>
          <div class="opt-nav-item">📜 Release History</div>
        </nav>

        <div class="opt-memory-box">
          <div class="opt-mem-title">Strict Memory Guard (Max 50 MB)</div>
          <div class="opt-mem-bar">
            <div class="opt-mem-fill"></div>
          </div>
          <div class="opt-mem-stat">0.42 MB / 50.0 MB Used (LRU Active)</div>
        </div>
      </aside>

      <main class="opt-content">
        <div class="opt-header">
          <h2>Supported Booking Sites & Badge Customizer</h2>
          <p>Customize where real-time delay badges appear across each individual booking platform.</p>
        </div>

        <div class="opt-card">
          <div class="opt-card-title">
            <span>MakeMyTrip (makemytrip.com) Settings</span>
            <span style="color:#16a34a; font-size:11px; font-weight:700;">● Active</span>
          </div>

          <div class="portal-cfg-box">
            <div class="portal-cfg-header">
              <span class="portal-cfg-title">MakeMyTrip Badge Placement</span>
              <span style="font-size:10.5px; color:#2563eb; font-weight:700;">Live Layout Adjusted</span>
            </div>
            <div class="radio-positions">
              <label><input type="radio" name="mmt-pos" checked> Beside Train Name (Default)</label>
              <label><input type="radio" name="mmt-pos"> Header Top Right</label>
              <label><input type="radio" name="mmt-pos"> Below Train Title</label>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#475569; padding-top:6px;">
            <span>Auto-Check All Visible Trains on MakeMyTrip:</span>
            <span style="background:#22c55e; color:white; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px;">ENABLED BY DEFAULT</span>
          </div>
        </div>

        <div class="opt-card">
          <div class="opt-card-title">
            <span>Redundant Data Gateways</span>
            <span style="color:#2563eb; font-size:11px; font-weight:700;">Automatic Failover Active</span>
          </div>
          <div style="font-size:11.5px; color:#475569; line-height:1.4;">
            <div>Primary Gateway: <strong>National Rail Network (Direct - 100% Free & Unlimited)</strong></div>
            <div>Secondary Gateway: <strong>RapidAPI Rail Engine Pool (Backup with 0ms latency)</strong></div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// Small Promo Tile (440x280) HTML
function getSmallPromoHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 440px;
      height: 280px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at 80% 20%, #1e293b 0%, #0f172a 60%, #050b14 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 26px;
      position: relative;
    }
    .tricolor-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-box {
      width: 68px;
      height: 68px;
      border-radius: 16px;
      background: #0f172a;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
      flex-shrink: 0;
      overflow: hidden;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .title-box h1 {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: #ffffff;
    }
    .title-box p {
      font-size: 11.5px;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 500;
    }
    .mmt-badge-preview {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .badge-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .badge-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #f8fafc;
    }
    .badge-status {
      font-size: 11px;
      font-weight: 800;
      color: #34d399;
      background: rgba(16, 185, 129, 0.2);
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .chips-footer {
      display: flex;
      gap: 8px;
    }
    .chip {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 9.5px;
      font-weight: 700;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="tricolor-bar"></div>
  <div class="brand-row">
    <div class="logo-box">
      <img src="${ICON_DATA_URL}" alt="Logo" />
    </div>
    <div class="title-box">
      <h1>Live Train Delay Tracker</h1>
      <p>Real-Time Status & Punctuality on MakeMyTrip</p>
    </div>
  </div>

  <div class="mmt-badge-preview">
    <div class="badge-left">
      <span class="pulse-dot"></span>
      <span class="badge-title">12952 • Tejas Rajdhani</span>
    </div>
    <span class="badge-status">🟢 ON TIME</span>
  </div>

  <div class="chips-footer">
    <span class="chip">⚡ 1-Click Fetch All</span>
    <span class="chip">📊 3-Metric Analytics</span>
    <span class="chip">🇮🇳 MakeMyTrip & IRCTC</span>
  </div>
</body>
</html>`;
}

// Marquee Promo Tile (1400x560) HTML
function getMarqueePromoHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1400px;
      height: 560px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at 20% 30%, #1e293b 0%, #0f172a 50%, #030712 100%);
      color: #ffffff;
      display: flex;
      position: relative;
    }
    .tricolor-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%);
      z-index: 10;
    }

    /* Left Content Panel */
    .marquee-left {
      width: 600px;
      padding: 50px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
      z-index: 2;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.4);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      color: #93c5fd;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      align-self: flex-start;
    }
    .hero-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .hero-title span.accent {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 15px;
      line-height: 1.5;
      color: #94a3b8;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 6px;
    }
    .feat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .feat-icon {
      font-size: 16px;
    }

    /* Right Preview Window */
    .marquee-right {
      flex: 1;
      padding: 40px 50px 40px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .preview-browser-frame {
      width: 680px;
      height: 460px;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .frame-bar {
      height: 36px;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 12px;
    }
    .window-dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot.r { background: #ef4444; }
    .dot.y { background: #f59e0b; }
    .dot.g { background: #10b981; }
    .url-bar {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      height: 22px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      font-size: 10.5px;
      color: #475569;
    }
    .frame-content {
      flex: 1;
      background: #f2f5f8;
      padding: 14px;
      overflow: hidden;
      position: relative;
    }
    .preview-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .pcard-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .pcard-name {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .pcard-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 9.5px;
      font-weight: 700;
    }
    .pcard-badge.on {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }
    .pcard-badge.late {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .pcard-times {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }
    .pcard-sub {
      font-size: 9px;
      color: #64748b;
      font-weight: 500;
    }
    .mini-hud {
      position: absolute;
      bottom: 12px;
      right: 14px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 8px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      width: 220px;
    }
    .mini-hud-title {
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }
    .mini-hud-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 4px 8px;
      font-size: 9.5px;
      font-weight: 700;
      width: 100%;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="tricolor-line"></div>

  <div class="marquee-left">
    <div class="badge-top">
      <img src="${ICON_DATA_URL}" width="16" height="16" style="border-radius:3px;" />
      CHROME & EDGE EXTENSION • v2.0.4
    </div>

    <h1 class="hero-title">
      Live Train Running Status <span class="accent">on MakeMyTrip</span>
    </h1>

    <p class="hero-subtitle">
      Real-time delay tracking, 30-day punctuality reliability scores, and smart 1-click on-demand updates directly inside your booking results.
    </p>

    <div class="feature-grid">
      <div class="feat-card">
        <span class="feat-icon">⚡</span>
        <span>1-Click Fetch All Delays</span>
      </div>
      <div class="feat-card">
        <span class="feat-icon">📊</span>
        <span>3-Metric Delay Analytics</span>
      </div>
      <div class="feat-card">
        <span class="feat-icon">💾</span>
        <span>Strict 50 MB Cache Guard</span>
      </div>
      <div class="feat-card">
        <span class="feat-icon">🇮🇳</span>
        <span>9+ Rail Portals Supported</span>
      </div>
    </div>
  </div>

  <div class="marquee-right">
    <div class="preview-browser-frame">
      <div class="frame-bar">
        <div class="window-dots">
          <div class="dot r"></div>
          <div class="dot y"></div>
          <div class="dot g"></div>
        </div>
        <div class="url-bar">https://www.makemytrip.com/railways/listing?src=NDLS&dest=MMCT</div>
      </div>

      <div class="frame-content">
        <!-- Card 1 -->
        <div class="preview-card">
          <div class="pcard-top">
            <span class="pcard-name">12952 • TEJAS RAJDHANI EXP</span>
            <span class="pcard-badge on">● 🚆 Live: On Time (0m delay)</span>
          </div>
          <div class="pcard-times">
            <div>16:55 <span class="pcard-sub">NDLS</span></div>
            <div style="font-size:10px; color:#64748b; font-weight:600;">15h 40m</div>
            <div>08:35 <span class="pcard-sub">MMCT</span></div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="preview-card">
          <div class="pcard-top">
            <span class="pcard-name">12954 • AUGUST KRANTI RAJ</span>
            <span class="pcard-badge late">● 🚆 Live: +18m Late</span>
          </div>
          <div class="pcard-times">
            <div>17:15 <span class="pcard-sub">NZM</span></div>
            <div style="font-size:10px; color:#64748b; font-weight:600;">16h 50m</div>
            <div>10:05 <span class="pcard-sub">MMCT</span></div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="preview-card">
          <div class="pcard-top">
            <span class="pcard-name">22210 • MMCT DURONTO EXP</span>
            <span class="pcard-badge on">● 🚆 Live: On Time</span>
          </div>
          <div class="pcard-times">
            <div>22:10 <span class="pcard-sub">NDLS</span></div>
            <div style="font-size:10px; color:#64748b; font-weight:600;">17h 40m</div>
            <div>15:50 <span class="pcard-sub">MMCT</span></div>
          </div>
        </div>

        <!-- Floating HUD Preview -->
        <div class="mini-hud">
          <div class="mini-hud-title">
            <img src="${ICON_DATA_URL}" width="14" height="14" style="border-radius:3px;" />
            <span>Train Delay Tracker • Active</span>
          </div>
          <button class="mini-hud-btn">⚡ Fetch All on MakeMyTrip</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Validation & 24-bit PNG conversion function using macOS sips
function convertAndValidate(jpegPath, pngPath, expectedWidth, expectedHeight) {
  // 1. Convert JPEG to 24-bit RGB PNG (which inherently discards alpha)
  execSync(`sips -s format png "${jpegPath}" -o "${pngPath}"`, { stdio: 'ignore' });

  // 2. Validate with sips
  const sipsOut = execSync(`sips -g pixelWidth -g pixelHeight -g hasAlpha -g space "${pngPath}"`).toString();
  const widthMatch = sipsOut.match(/pixelWidth:\s*(\d+)/);
  const heightMatch = sipsOut.match(/pixelHeight:\s*(\d+)/);
  const alphaMatch = sipsOut.match(/hasAlpha:\s*(yes|no)/i);
  const spaceMatch = sipsOut.match(/space:\s*([^\n]+)/);

  const actualWidth = widthMatch ? parseInt(widthMatch[1], 10) : 0;
  const actualHeight = heightMatch ? parseInt(heightMatch[1], 10) : 0;
  const hasAlpha = alphaMatch ? alphaMatch[1].toLowerCase() : 'unknown';
  const colorSpace = spaceMatch ? spaceMatch[1].trim() : 'unknown';

  const isValid = actualWidth === expectedWidth && actualHeight === expectedHeight && hasAlpha === 'no';
  return {
    actualWidth,
    actualHeight,
    hasAlpha,
    colorSpace,
    isValid
  };
}

async function main() {
  console.log('================================================================');
  console.log('🎨 Generating Store Promotional Assets for MakeMyTrip');
  console.log('   Target Specs: Screenshots (1280x800), Small Tile (440x280), Marquee (1400x560)');
  console.log('   Format Requirement: JPEG or 24-bit PNG (no alpha)');
  console.log('================================================================\n');

  const browser = await chromium.launch();

  // Task definitions
  const tasks = [
    {
      id: 'screenshot-1-mmt-live-delays',
      title: 'Screenshot 1: Live Delays Overview on MakeMyTrip',
      width: 1280,
      height: 800,
      html: getMmtBaseHtml({
        titleBanner: 'Real-Time Live Train Delays Directly on MakeMyTrip',
        subBanner: 'Automatic real-time delay badges beside every train on page load with 0ms latency',
        mainContent: getMmtTrainCardsHtml({ openPopover: false })
      })
    },
    {
      id: 'screenshot-2-mmt-floating-hud',
      title: 'Screenshot 2: One-Click Floating Controller HUD',
      width: 1280,
      height: 800,
      html: getMmtBaseHtml({
        titleBanner: 'One-Click Floating Action Controller on MakeMyTrip',
        subBanner: 'Instantly check all visible trains, monitor live active routes & access settings',
        mainContent: getMmtTrainCardsHtml({ openPopover: false }),
        overlayContent: getFloatingHudHtml()
      })
    },
    {
      id: 'screenshot-3-mmt-analytics-popover',
      title: 'Screenshot 3: Deep 3-Metric Punctuality Analytics Popover',
      width: 1280,
      height: 800,
      html: getMmtBaseHtml({
        titleBanner: 'Comprehensive 3-Metric Delay & Punctuality Analytics',
        subBanner: 'Hover or click to inspect live delay, 4-week day-of-week trends, and 30-day reliability ratings',
        mainContent: getMmtTrainCardsHtml({ openPopover: true }),
        overlayContent: getFloatingHudHtml()
      })
    },
    {
      id: 'screenshot-4-popup-quick-search',
      title: 'Screenshot 4: Instant 5-Digit Train Search Popup',
      width: 1280,
      height: 800,
      html: getMmtBaseHtml({
        titleBanner: 'Instant 5-Digit Train Number Quick Search Popup',
        subBanner: 'Track live status for any Indian Railways train in seconds without opening new tabs',
        mainContent: getMmtTrainCardsHtml({ openPopover: false }),
        overlayContent: getPopupHtml()
      })
    },
    {
      id: 'screenshot-5-options-customization',
      title: 'Screenshot 5: Modern Options Dashboard & Badge Placement',
      width: 1280,
      height: 800,
      html: getMmtBaseHtml({
        titleBanner: 'Custom Badge Placement & Strict 50 MB Cache Guard',
        subBanner: 'Personalize MakeMyTrip badge positions, toggle auto-checking, and configure redundant gateways',
        mainContent: getMmtTrainCardsHtml({ openPopover: false }),
        overlayContent: getOptionsHtml()
      })
    },
    {
      id: 'small-promo-tile-440x280',
      title: 'Small Promo Tile (440x280 Canvas)',
      width: 440,
      height: 280,
      html: getSmallPromoHtml()
    },
    {
      id: 'marquee-promo-tile-1400x560',
      title: 'Marquee Promo Tile (1400x560 Canvas)',
      width: 1400,
      height: 560,
      html: getMarqueePromoHtml()
    }
  ];

  const results = [];

  for (const task of tasks) {
    console.log(`📸 Rendering [${task.id}] (${task.width}x${task.height})...`);

    const page = await browser.newPage({
      viewport: { width: task.width, height: task.height },
      deviceScaleFactor: 1
    });

    await page.setContent(task.html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const jpegPath = path.join(OUTPUT_DIR, `${task.id}.jpg`);
    const pngPath = path.join(OUTPUT_DIR, `${task.id}.png`);

    // Capture ultra-crisp JPEG (no alpha)
    await page.screenshot({ path: jpegPath, type: 'jpeg', quality: 98 });

    // Generate 24-bit PNG with no alpha channel
    const validation = convertAndValidate(jpegPath, pngPath, task.width, task.height);

    // Copy to brain artifacts dir for chat presentation
    fs.copyFileSync(jpegPath, path.join(ARTIFACTS_DIR, `${task.id}.jpg`));
    fs.copyFileSync(pngPath, path.join(ARTIFACTS_DIR, `${task.id}.png`));

    const statusIcon = validation.isValid ? '✅' : '❌';
    console.log(`   ${statusIcon} Dimensions: ${validation.actualWidth}x${validation.actualHeight} | Alpha: ${validation.hasAlpha} | Space: ${validation.colorSpace}`);
    console.log(`   📦 Saved: ${task.id}.jpg & ${task.id}.png`);

    results.push({
      ...task,
      validation,
      jpegPath,
      pngPath
    });

    await page.close();
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('🎉 All Promotional Assets Successfully Generated & Validated!');
  console.log('----------------------------------------------------------------');
  console.log(`📂 Output Directory: ${OUTPUT_DIR}`);
  console.log(`📂 Artifacts Copy:   ${ARTIFACTS_DIR}`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('❌ Error generating assets:', err);
  process.exit(1);
});
