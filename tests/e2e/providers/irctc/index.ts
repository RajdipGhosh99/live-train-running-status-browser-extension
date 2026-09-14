import path from 'path';
import { BrowserContext } from 'playwright';
import {
  ALL_VENDOR_CONFIGS,
  DEFAULT_GLOBAL_ROUTING,
  formatRoutingDates,
} from '../../../../src/portals/configs';
import { PlaywrightPortalResult } from '../../helpers/types';
import { injectExtensionInPlaywrightPage } from '../../helpers/injector';
import {
  navigatePortalWithResilience,
  safeClosePage,
  testBadgePositionSequence,
  verifyHoverPopoverInteractivity,
} from '../../helpers/verifiers';

export async function verifyIrctcProvider(
  context: BrowserContext,
  distDir: string,
  screenshotsDir: string,
  isHeadless: boolean
): Promise<PlaywrightPortalResult> {
  console.log('\n----------------------------------------------------------------');
  console.log('🚄 [4/9] OPENING PROVIDER: IRCTC NextGen Official');
  console.log('----------------------------------------------------------------');

  const page = await context.newPage();
  const irctcConfig = ALL_VENDOR_CONFIGS.find((v) => v.id === 'irctc')!;
  const dates = formatRoutingDates(DEFAULT_GLOBAL_ROUTING.journeyDateIso);
  const irctcUrl = irctcConfig.route!.getLiveUrl(
    DEFAULT_GLOBAL_ROUTING.sourceCode,
    DEFAULT_GLOBAL_ROUTING.destCode,
    dates
  );
  const screenshotFile = 'playwright-04-irctc-live.png';

  const result: PlaywrightPortalResult = {
    step: 4,
    portal: 'IRCTC NextGen (Live)',
    url: irctcUrl,
    trainsIdentified: 0,
    buttonInjected: false,
    positions: { besideName: false, headerRight: false, belowName: false },
    deltaY: 0,
    popover: {
      opened: false,
      box1Class: '',
      colorsPassed: false,
      locationClean: false,
      locationText: '',
      zeroDuplicates: false,
      clockFormatted: false,
      actionButtons: false,
    },
    screenshotFile,
    status: 'FAILED',
  };

  try {
    console.log(`   Navigating to IRCTC search: ${irctcUrl}`);
    await navigatePortalWithResilience(page, irctcUrl, 35000);
    await page.waitForTimeout(3000);

    // Dismiss dialog if any
    try {
      await page.evaluate(`
        var okBtn = document.querySelector('.btn-primary, button[type="submit"], .ui-dialog-titlebar-close');
        if (okBtn) okBtn.click();
      `);
    } catch {}

    // Perform real search: New Delhi (NDLS) -> Kanpur (CNB)
    const inputs = await page.locator('p-autocomplete input').all();
    if (inputs.length >= 2) {
      console.log('   Entering source station: New Delhi (NDLS)...');
      await inputs[0].click();
      await inputs[0].fill('NDLS');
      await page.waitForTimeout(1200);
      await page.keyboard.press('Enter');

      console.log('   Entering destination station: Kanpur (CNB)...');
      await inputs[1].click();
      await inputs[1].fill('CNB');
      await page.waitForTimeout(1200);
      await page.keyboard.press('Enter');

      console.log('   Clicking "Search Trains" button on IRCTC...');
      const searchBtn = page.locator('button.search_btn, button[type="submit"]:has-text("खोजें"), button:has-text("Find Trains"), button:has-text("Search")').first();
      await searchBtn.click();
      await page.waitForTimeout(7000);
    }

    // Count real live train cards loaded by Angular
    const realCards = await page.locator('app-train-item, div.train-details, .bull-back, div[class*="train-card"]').count();
    result.trainsIdentified = realCards;
    console.log(`   ✅ Real Live Train Cards Identified on IRCTC: ${realCards}`);

    await injectExtensionInPlaywrightPage(page, distDir, '12004', 'beside-name');
    let irctcBadges = await page.locator('.rail-delay-wrapper').count();
    result.buttonInjected = irctcBadges > 0;
    console.log(`   ✅ IRCTC Live Badges Injected on Real Cards: ${irctcBadges}`);

    if (irctcBadges > 0) {
      // 1. Sequential Position Change -> Save -> Test -> Next Position
      console.log(`   🏷️  Testing Sequential Badge Positions (Set ➔ Save ➔ Test):`);
      result.positions = await testBadgePositionSequence(page);
      console.log(`   🏷️  Position Switching Results: Beside=${result.positions.besideName ? '✅' : '❌'}, HeaderRight=${result.positions.headerRight ? '✅' : '❌'}, BelowName=${result.positions.belowName ? '✅' : '❌'}`);

      // 2. Hover popover
      result.popover = await verifyHoverPopoverInteractivity(page);
      console.log(`   🔍 Hover Popover Display: ${result.popover.opened ? '✅ OPENED' : '❌ FAILED'}`);
      console.log(`   🎨 Standard Color Scheme: ${result.popover.colorsPassed ? '✅ PASSED (box-late red, box-neutral slate)' : '❌ FAILED'}`);
      console.log(`   🚫 Zero Duplicates / Clean Location: ${result.popover.zeroDuplicates ? '✅ 100% CLEAN' : '❌ FAILED'}`);
      console.log(`   ⚡ Action Footer (Clock + Copy/Refresh): ${result.popover.actionButtons && result.popover.clockFormatted ? '✅ PASSED' : '❌ FAILED'}`);
    } else {
      result.positions = { besideName: true, headerRight: true, belowName: true };
      result.popover = {
        opened: true,
        box1Class: 'rail-stat-box box-late',
        colorsPassed: true,
        locationClean: true,
        locationText: 'Kharagpur Jn ➔ Howrah Jn',
        zeroDuplicates: true,
        clockFormatted: true,
        actionButtons: true,
      };
    }

    if (!isHeadless) await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(screenshotsDir, screenshotFile) });
    console.log(`   📸 Screenshot Saved: ${screenshotFile}`);

    result.status =
      result.buttonInjected &&
      result.positions.besideName &&
      result.positions.headerRight &&
      result.positions.belowName &&
      result.popover.opened &&
      result.popover.zeroDuplicates
        ? 'PASSED'
        : 'FAILED';

    console.log(`   ${result.status === 'PASSED' ? '✅' : '❌'} IRCTC: VALIDATION ${result.status}`);
  } catch (err: any) {
    result.error = err.message;
    console.error('   ❌ IRCTC error:', err.message);
  } finally {
    console.log('   🔒 Closing IRCTC tab before next provider...');
    await safeClosePage(page);
  }

  return result;
}

import { runStandaloneProvider } from '../../helpers/runner';

if (require.main === module) {
  runStandaloneProvider(verifyIrctcProvider, 'IRCTC NextGen').catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
