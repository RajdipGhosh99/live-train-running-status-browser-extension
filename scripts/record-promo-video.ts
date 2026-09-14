/**
 * Promotional Video Recording Script for Chrome Web Store / YouTube
 * Records a professional, smooth 720p HD screencast showcasing:
 * 1. Branded Intro
 * 2. Real MakeMyTrip search page with blurred logo & live badges
 * 3. Interactive 3-metric analytics popover
 * 4. Floating HUD Controller with 1-click Fetch All
 * 5. Instant 5-Digit Search Popup
 * 6. Supported portals & Outro CTA
 */

import fs from 'fs';
import path from 'path';
import { chromium, Page } from 'playwright';
import { navigatePortalWithResilience } from '../tests/e2e/helpers/verifiers';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const STORE_DIR = path.resolve(ROOT_DIR, 'store-assets');
const DOWNLOADS_DIR = path.resolve(process.env.HOME || '/Users/rajdip', 'Downloads');
const DOWNLOADS_STORE_DIR = path.join(DOWNLOADS_DIR, 'store-assets');
const ARTIFACTS_DIR = '/Users/rajdip/.gemini/antigravity/brain/35f307b3-b767-4c12-95c6-6986c4aa6066/store-assets';
const TEMP_VIDEO_DIR = path.resolve(ROOT_DIR, 'store-assets/temp-video');
const USER_DATA_DIR = path.resolve(ROOT_DIR, '.playwright-video-session');

[STORE_DIR, DOWNLOADS_DIR, DOWNLOADS_STORE_DIR, ARTIFACTS_DIR, TEMP_VIDEO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function setupVirtualCursor(page: Page) {
  await page.evaluate(() => {
    if (document.getElementById('virtual-cursor')) return;

    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));">
        <path d="M5.5 3.5L11.5 20.5L14.5 13.5L21.5 10.5L5.5 3.5Z" fill="#2563eb" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <div id="cursor-ripple" style="position:absolute; top:3px; left:5px; width:0; height:0; border-radius:50%; background:rgba(37,99,235,0.4); transform:translate(-50%, -50%); pointer-events:none; transition:width 0.3s, height 0.3s, opacity 0.3s; opacity:0;"></div>
    `;
    cursor.style.position = 'fixed';
    cursor.style.top = '0px';
    cursor.style.left = '0px';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999999';
    cursor.style.transform = 'translate(640px, 360px)';
    cursor.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.9, 0.3, 1)';
    document.body.appendChild(cursor);

    (window as any).__moveCursor = (x: number, y: number) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    (window as any).__clickCursor = () => {
      const ripple = document.getElementById('cursor-ripple');
      if (ripple) {
        ripple.style.width = '36px';
        ripple.style.height = '36px';
        ripple.style.opacity = '1';
        setTimeout(() => {
          ripple.style.width = '0px';
          ripple.style.height = '0px';
          ripple.style.opacity = '0';
        }, 300);
      }
    };
  });
}

async function moveCursor(page: Page, x: number, y: number, waitMs = 600) {
  await page.evaluate(({ x, y }) => {
    if ((window as any).__moveCursor) (window as any).__moveCursor(x, y);
  }, { x, y });
  await page.waitForTimeout(waitMs);
}

async function clickAt(page: Page, x: number, y: number) {
  await moveCursor(page, x, y, 400);
  await page.evaluate(() => {
    if ((window as any).__clickCursor) (window as any).__clickCursor();
  });
  await page.waitForTimeout(200);
}

async function run() {
  console.log('================================================================');
  console.log('🎬 RECORDING PROMOTIONAL VIDEO FOR LIVE TRAIN DELAY TRACKER');
  console.log('   Target Resolution: 1280x720 (720p HD 16:9 Standard)');
  console.log('   Output: live-train-delay-tracker-promo.webm');
  console.log('================================================================\n');

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    recordVideo: {
      dir: TEMP_VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });

  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker', { timeout: 6000 }).catch(() => null as any);
  }
  const extensionId = background ? background.url().split('/')[2] : 'kkgghkpjaddmnpigcbmheimdhchbhijf';
  console.log(`Extension ID: ${extensionId}`);

  const page = context.pages()[0] || (await context.newPage());
  const video = page.video();
  const iconBase64 = fs.readFileSync(path.join(DIST_DIR, 'icons/icon128.png')).toString('base64');

  // ===========================================================================
  // SCENE 1: Branded Intro (0:00 - 0:05)
  // ===========================================================================
  console.log('1. Recording Intro Scene (Branded Title & Hook)...');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          width: 1280px; height: 720px; overflow: hidden;
          background: radial-gradient(circle at 50% 40%, #1e293b 0%, #090e17 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; color: #ffffff; text-align: center;
        }
        .tricolor-stripe {
          position: absolute; top:0; left:0; right:0; height: 6px;
          background: linear-gradient(90deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%);
        }
        .logo-box {
          width: 100px; height: 100px; border-radius: 26px;
          background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 20px 50px rgba(37,99,235,0.4), 0 0 40px rgba(56,189,248,0.2);
          display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
          animation: float 3s ease-in-out infinite;
        }
        .logo-box img { width: 76px; height: 76px; border-radius: 18px; }
        .title { font-size: 44px; font-weight: 900; letter-spacing: -1.2px; line-height: 1.15; margin-bottom: 12px; }
        .highlight {
          background: linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .sub { font-size: 20px; color: #94a3b8; font-weight: 500; max-width: 680px; line-height: 1.5; margin-bottom: 28px; }
        .pills { display: flex; gap: 14px; }
        .pill {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          padding: 8px 18px; border-radius: 9999px; font-size: 13px; font-weight: 600; color: #cbd5e1;
        }
        .pill.live {
          background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #f87171;
          display: flex; align-items: center; gap: 8px;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
      </style>
    </head>
    <body>
      <div class="tricolor-stripe"></div>
      <div class="logo-box">
        <img src="data:image/png;base64,${iconBase64}" />
      </div>
      <div class="title">Live Train <span class="highlight">Delay Tracker</span></div>
      <div class="sub">Real-Time Indian Railways Live Delays & 30-Day Punctuality Intelligence Directly Inside Booking Portals</div>
      <div class="pills">
        <div class="pill live"><div class="dot"></div> Real-Time Live Running Status</div>
        <div class="pill">9 Portals Supported</div>
        <div class="pill">100% Free & Open-Source</div>
      </div>
    </body>
    </html>
  `);
  await page.waitForTimeout(4000);

  // ===========================================================================
  // SCENE 2: Live MakeMyTrip Search Page & Badges (0:05 - 0:15)
  // ===========================================================================
  console.log('2. Recording Live MakeMyTrip page with delay badges...');
  const mmtUrl = 'https://www.makemytrip.com/railways/listing?srcCity=Kharagpur&destCity=Howrah&srcStn=KGP&destStn=HWH&date=20260909&classType=ALL';
  await navigatePortalWithResilience(page, mmtUrl, 35000);
  await page.waitForTimeout(3000);

  try {
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.commonModal__close, [data-cy="closeModal"], .modalClose');
      if (closeBtn) (closeBtn as HTMLElement).click();
    });
  } catch {}

  // Apply logo blur and clean layout
  await page.evaluate(() => {
    document.querySelectorAll('.logoContainer, .chMmtLogo, img[alt*="LOGO"], img[src*="mmt_dt_header_icon"], [data-cy*="Logo"]').forEach(el => {
      (el as HTMLElement).style.filter = 'blur(10px)';
    });
    document.querySelectorAll('[data-cy*="userProfile"], [class*="loginIcon"], .userProfile').forEach(el => {
      (el as HTMLElement).style.filter = 'blur(8px)';
    });
    document.querySelectorAll('[class*="secondarySupply"], [class*="SecondarySupply"], [class*="Refund"], [class*="refund"], [class*="Aadhaar"], [class*="banner"]').forEach(el => {
      el.remove();
    });
  });

  // Inject content script and realistic delays
  const cssPath = path.join(DIST_DIR, 'src/styles/styles.css');
  const jsPath = path.join(DIST_DIR, 'src/content/index.iife.js');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  await page.evaluate(`
    (function() {
      document.querySelectorAll('.rail-delay-wrapper').forEach(function(w) { w.remove(); });
      document.querySelectorAll('[data-rail-train]').forEach(function(c) { c.removeAttribute('data-rail-train'); });

      window.chrome = window.chrome || {};
      window.chrome.runtime = window.chrome.runtime || {};
      window.chrome.runtime.sendMessage = function (msg) {
        var trainNo = (msg && msg.trainNumber) || '20872';
        var num = parseInt(trainNo, 10) || 20872;
        
        var isDelayed = false;
        var delayMinutes = 0;
        var statusSummary = 'Running on time';
        var currentStation = 'Kharagpur Jn';
        var nextStation = 'Santragachi Jn';
        var punctuality = 97;
        var monthAvg = 3;

        if (num === 20872) {
          isDelayed = false; delayMinutes = 0; statusSummary = 'Running on time (Right Time)';
          currentStation = 'Kharagpur Jn'; nextStation = 'Santragachi Jn'; punctuality = 97; monthAvg = 3;
        } else if (num === 12828) {
          isDelayed = true; delayMinutes = 14; statusSummary = 'Running 14 minutes late';
          currentStation = 'Midnapore'; nextStation = 'Kharagpur Jn'; punctuality = 89; monthAvg = 16;
        } else if (num === 12810) {
          isDelayed = true; delayMinutes = 38; statusSummary = 'Running 38 minutes late';
          currentStation = 'Tatanagar Jn'; nextStation = 'Kharagpur Jn'; punctuality = 78; monthAvg = 34;
        } else {
          isDelayed = (num % 2 === 0); delayMinutes = isDelayed ? 12 : 0;
          statusSummary = isDelayed ? 'Running 12 minutes late' : 'Running on time'; punctuality = isDelayed ? 88 : 95;
        }

        return Promise.resolve({
          success: true,
          data: {
            trainNumber: trainNo,
            trainName: (msg && msg.trainName) || 'Express',
            delayMinutes: delayMinutes,
            statusSummary: statusSummary,
            currentStationName: currentStation,
            nextStationName: nextStation,
            lastUpdatedIso: new Date().toISOString(),
            delayHistory: {
              todayAvgDelayMinutes: delayMinutes,
              monthAvgDelayMinutes: monthAvg,
              punctualityRatePercent: punctuality,
              historicalRunsAnalyzed: 30,
            },
          },
        });
      };

      window.chrome.storage = window.chrome.storage || {};
      window._mockStorageData = window._mockStorageData || {};
      var host = window.location.hostname.replace(/^www\\./, '');
      window._mockStorageData[host] = 'beside-name';

      window.chrome.storage.local = {
        get: function (_keys, cb) {
          var sitePositions = {};
          sitePositions[host] = 'beside-name';
          cb({
            rail_delay_tracker_settings: {
              extensionEnabled: true,
              disabledSites: [],
              sitePositions: sitePositions,
              activeProvider: 'direct-rail-gateway',
              termsAccepted: true,
              showFloatingHUD: true,
            }
          });
        },
        set: function(obj, cb) { if (cb) cb(); }
      };

      if (!document.getElementById('rail-extension-styles')) {
        var s = document.createElement('style');
        s.id = 'rail-extension-styles';
        s.textContent = ${JSON.stringify(cssContent)};
        document.head.appendChild(s);
      }
    })()
  `);

  await page.evaluate(jsContent);
  await page.waitForTimeout(1000);

  // Trigger clicks on badges
  await page.evaluate(() => {
    document.querySelectorAll('.rail-delay-badge').forEach((btn, idx) => {
      setTimeout(() => { (btn as HTMLElement).click(); }, idx * 40);
    });
  });
  await page.waitForTimeout(2000);

  // Setup virtual cursor on page
  await setupVirtualCursor(page);

  // Animate cursor browsing the train cards
  await moveCursor(page, 450, 240, 800);
  await moveCursor(page, 480, 480, 800);
  await page.waitForTimeout(1500);

  // ===========================================================================
  // SCENE 3: Interactive Analytics Popover (0:15 - 0:24)
  // ===========================================================================
  console.log('3. Recording Interactive Analytics Popover...');
  // Move cursor to the badge on second train (12828 Purulia Howrah SF)
  const badgePos = await page.evaluate(() => {
    const wrappers = document.querySelectorAll('.rail-delay-wrapper');
    const target = wrappers[1] || wrappers[0];
    const btn = target ? target.querySelector('.rail-delay-badge') : null;
    if (btn) {
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: 480, y: 560 };
  });

  await clickAt(page, badgePos.x, badgePos.y);

  // Open & pin popover
  await page.evaluate(() => {
    const wrappers = document.querySelectorAll('.rail-delay-wrapper');
    const target = wrappers[1] || wrappers[0];
    const pop = target ? target.querySelector('.rail-delay-popover') : null;
    if (pop) {
      pop.classList.add('is-open');
      (pop as HTMLElement).style.display = 'block';
      (pop as HTMLElement).style.opacity = '1';
      (pop as HTMLElement).style.visibility = 'visible';
      (pop as HTMLElement).style.zIndex = '99999';
    }
  });
  await page.waitForTimeout(1000);

  // Move cursor across the 3 stat boxes inside popover
  await moveCursor(page, badgePos.x - 20, badgePos.y - 120, 900);
  await moveCursor(page, badgePos.x + 40, badgePos.y - 120, 900);

  // Click Copy Button
  const copyBtnPos = await page.evaluate(() => {
    const btn = document.querySelector('.rail-btn-copy');
    if (btn) {
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return null;
  });
  if (copyBtnPos) {
    await clickAt(page, copyBtnPos.x, copyBtnPos.y);
  }
  await page.waitForTimeout(2000);

  // ===========================================================================
  // SCENE 4: Floating Controller HUD (0:24 - 0:31)
  // ===========================================================================
  console.log('4. Recording Floating Controller HUD Action...');
  // Hide popover
  await page.evaluate(() => {
    document.querySelectorAll('.rail-delay-popover').forEach(p => {
      (p as HTMLElement).style.display = 'none';
    });
  });

  // Highlight HUD and click "Fetch All"
  const hudBtnPos = await page.evaluate(() => {
    const hud = document.getElementById('rail-live-hud');
    if (hud) {
      hud.style.display = 'block';
      hud.style.transform = 'scale(1.05)';
      hud.style.boxShadow = '0 20px 45px rgba(0,0,0,0.3), 0 0 0 2px rgba(37,99,235,0.5)';
      const btn = hud.querySelector('button, .hud-fetch-all, [class*="btn"]');
      if (btn) {
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
    return { x: 860, y: 670 };
  });

  await clickAt(page, hudBtnPos.x, hudBtnPos.y);
  await page.waitForTimeout(3000);

  // ===========================================================================
  // SCENE 5: Extension Search Popup (0:31 - 0:38)
  // ===========================================================================
  console.log('5. Recording Extension Search Popup...');
  // Overlay popup directly on page with rich animated UI
  await page.evaluate((icon) => {
    let overlay = document.getElementById('store-popup-overlay-anim');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'store-popup-overlay-anim';
      overlay.style.position = 'fixed';
      overlay.style.top = '16px';
      overlay.style.right = '24px';
      overlay.style.width = '380px';
      overlay.style.borderRadius = '16px';
      overlay.style.boxShadow = '0 30px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.12)';
      overlay.style.overflow = 'hidden';
      overlay.style.zIndex = '999999';
      overlay.style.backgroundColor = '#ffffff';
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateY(-12px)';
      overlay.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      overlay.innerHTML = [
        '<div style="padding: 16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between;">',
        '  <div style="display:flex; align-items:center; gap:10px;">',
        '    <img src="data:image/png;base64,' + icon + '" style="width:34px; height:34px; border-radius:8px;" />',
        '    <div>',
        '      <div style="font-size:14px; font-weight:800; color:#0f172a;">Train Delay Tracker <span style="font-size:11px; color:#64748b; font-weight:600;">v2.0.4</span></div>',
        '      <div style="font-size:11px; color:#64748b;">by Rajdip Ghosh · Community Edition</div>',
        '    </div>',
        '  </div>',
        '  <div style="background:#ecfdf5; color:#059669; padding:4px 10px; border-radius:9999px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:5px;">',
        '    <span style="width:6px; height:6px; border-radius:50%; background:#10b981;"></span> ACTIVE',
        '  </div>',
        '</div>',
        '<div style="padding: 16px 20px; display:flex; flex-direction:column; gap:12px;">',
        '  <div style="background:#f1f5f9; padding:12px 14px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">',
        '    <div>',
        '      <div style="font-size:12px; font-weight:700; color:#1e293b;">Live Delay Badges</div>',
        '      <div style="font-size:10px; color:#64748b;">Active on booking websites</div>',
        '    </div>',
        '    <div style="width:38px; height:22px; background:#2563eb; border-radius:9999px; position:relative;">',
        '      <div style="width:18px; height:18px; background:#ffffff; border-radius:50%; position:absolute; top:2px; right:2px; box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>',
        '    </div>',
        '  </div>',
        '  <div style="border:1px solid #e2e8f0; border-radius:12px; padding:14px;">',
        '    <div style="font-size:11px; font-weight:800; color:#2563eb; letter-spacing:0.5px; margin-bottom:8px;">⚡ INSTANT LOOKUP</div>',
        '    <div style="display:flex; gap:8px;">',
        '      <div style="flex:1; border:1.5px solid #2563eb; border-radius:8px; padding:8px 12px; font-size:13px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px;">',
        '        <span>🚆</span> <span id="popup-type-target">12864</span>',
        '      </div>',
        '      <button style="background:#2563eb; color:#ffffff; border:none; padding:8px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;">Track Live ⚡</button>',
        '    </div>',
        '    <div style="display:flex; gap:6px; margin-top:10px; font-size:10px; color:#64748b; font-weight:600;">',
        '      <span>RECENT:</span>',
        '      <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#334155;">#12952</span>',
        '      <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#334155;">#12301</span>',
        '      <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#334155;">#12004</span>',
        '    </div>',
        '  </div>',
        '  <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 14px;">',
        '    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">',
        '      <span style="font-size:12px; font-weight:800; color:#991b1b;">12864 Howrah Superfast Express</span>',
        '      <span style="background:#fee2e2; color:#b91c1c; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:800;">● 14m Late</span>',
        '    </div>',
        '    <div style="font-size:11px; color:#7f1d1d; font-weight:600;">📍 Departed Midnapore ➔ Next: Kharagpur Jn</div>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(overlay);

      setTimeout(() => {
        overlay!.style.opacity = '1';
        overlay!.style.transform = 'translateY(0)';
      }, 50);
    }
  }, iconBase64);

  await moveCursor(page, 1080, 150, 700);
  await clickAt(page, 1180, 150);
  await page.waitForTimeout(3000);

  // ===========================================================================
  // SCENE 6: Supported Portals & Outro CTA (0:38 - 0:44)
  // ===========================================================================
  console.log('6. Recording Outro Scene & Supported Portals...');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          width: 1280px; height: 720px; overflow: hidden;
          background: radial-gradient(circle at 50% 40%, #1e293b 0%, #090e17 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; color: #ffffff; text-align: center;
        }
        .tricolor-stripe {
          position: absolute; top:0; left:0; right:0; height: 6px;
          background: linear-gradient(90deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%);
        }
        .logo-row { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
        .logo-row img { width: 56px; height: 56px; border-radius: 14px; box-shadow: 0 8px 25px rgba(37,99,235,0.4); }
        .title { font-size: 38px; font-weight: 900; letter-spacing: -0.8px; }
        .highlight { color: #38bdf8; }
        .tagline { font-size: 18px; color: #94a3b8; margin-bottom: 28px; }
        .grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          max-width: 780px; margin-bottom: 34px;
        }
        .card {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          padding: 12px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; color: #e2e8f0;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .check { color: #22c55e; font-size: 16px; font-weight: 900; }
        .cta-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff; padding: 14px 34px; border-radius: 9999px;
          font-size: 18px; font-weight: 800; letter-spacing: -0.2px;
          box-shadow: 0 12px 30px rgba(37,99,235,0.5);
          display: inline-flex; align-items: center; gap: 10px;
        }
        .credit { margin-top: 20px; font-size: 13px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="tricolor-stripe"></div>
      <div class="logo-row">
        <img src="data:image/png;base64,${iconBase64}" />
        <div class="title">Live Train <span class="highlight">Delay Tracker</span></div>
      </div>
      <div class="tagline">Seamlessly works across all major Indian train booking portals</div>

      <div class="grid">
        <div class="card"><span class="check">✓</span> ConfirmTkt</div>
        <div class="card"><span class="check">✓</span> MakeMyTrip</div>
        <div class="card"><span class="check">✓</span> IRCTC NextGen</div>
        <div class="card"><span class="check">✓</span> ClearTrip</div>
        <div class="card"><span class="check">✓</span> Ixigo Trains</div>
        <div class="card"><span class="check">✓</span> Goibibo</div>
        <div class="card"><span class="check">✓</span> Paytm Trains</div>
        <div class="card"><span class="check">✓</span> EaseMyTrip</div>
        <div class="card"><span class="check">✓</span> RailYatri</div>
      </div>

      <div class="cta-btn">Available on Chrome Web Store & Edge Add-ons</div>
      <div class="credit">Open-Source · Created by Rajdip Ghosh · Free Forever</div>
    </body>
    </html>
  `);
  await page.waitForTimeout(4000);

  // Finalize video recording
  console.log('\nClosing browser and finalizing video stream...');
  await page.close();
  await context.close();

  // Find the recorded webm file in temp directory
  const files = fs.readdirSync(TEMP_VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No webm video recorded in ' + TEMP_VIDEO_DIR);
  }

  // Get the most recently modified video file
  const videoFile = files
    .map(f => ({ name: f, time: fs.statSync(path.join(TEMP_VIDEO_DIR, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time)[0].name;

  const srcVideoPath = path.join(TEMP_VIDEO_DIR, videoFile);
  const outName = 'live-train-delay-tracker-promo.webm';
  const outJpgPoster = 'promo-video-thumbnail.jpg';

  const outPathRoot = path.join(STORE_DIR, outName);
  const outPathDownloads = path.join(DOWNLOADS_DIR, outName);
  const outPathDownloadsStore = path.join(DOWNLOADS_STORE_DIR, outName);
  const outPathArtifacts = path.join(ARTIFACTS_DIR, outName);

  fs.copyFileSync(srcVideoPath, outPathRoot);
  fs.copyFileSync(srcVideoPath, outPathDownloads);
  fs.copyFileSync(srcVideoPath, outPathDownloadsStore);
  fs.copyFileSync(srcVideoPath, outPathArtifacts);

  // Clean temp folder
  fs.rmSync(TEMP_VIDEO_DIR, { recursive: true, force: true });

  const sizeMb = (fs.statSync(outPathDownloads).size / (1024 * 1024)).toFixed(2);
  console.log('================================================================');
  console.log(`🎉 PROMOTIONAL VIDEO SUCCESSFULLY CREATED & SAVED! (${sizeMb} MB)`);
  console.log(`📂 Saved in Downloads: ${outPathDownloads}`);
  console.log(`📂 Saved in Store Assets: ${outPathDownloadsStore}`);
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
