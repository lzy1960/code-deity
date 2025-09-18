import { AdMob, AdmobConsentStatus, RewardAdPluginEvents, type AdLoadInfo, type AdMobRewardItem, type RewardAdOptions } from '@capacitor-community/admob';
import { useAdState, type BoostType } from '~/composables/useAdState';

const _isInitialized = ref(false);
export const isAdMobInitialized = readonly(_isInitialized);

/**
 * Initializes the AdMob plugin and sets up persistent event listeners.
 * This should be called once when the app starts.
 */
export async function initializeAdMob() {
  await AdMob.initialize();

  const [trackingInfo, consentInfo] = await Promise.all([
    AdMob.trackingAuthorizationStatus(),
    AdMob.requestConsentInfo(),
  ]);

  if (trackingInfo.status === 'notDetermined') {
    await AdMob.requestTrackingAuthorization();
  }

  const authorizationStatus = await AdMob.trackingAuthorizationStatus();
  if (
    authorizationStatus.status === 'authorized' &&
    consentInfo.isConsentFormAvailable &&
    consentInfo.status === AdmobConsentStatus.REQUIRED
  ) {
    await AdMob.showConsentForm();
  }
  _isInitialized.value = true;

  // Add the persistent reward listener as the single source of truth for rewards
  const adState = useAdState();
  AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
    if (rewardItem && rewardItem.amount > 0) {
      adState.rewardGranted.value = true;
    }
  });
}

/**
 * Shows a rewarded video ad. This function now only triggers the ad 
 * and sets the context for the reward. The actual reward is handled by the global listener.
 * @param boostType The type of boost being requested, to be checked by the central watcher.
 */
export async function showRewardVideoAd(boostType: BoostType): Promise<void> {
  const adState = useAdState();

  if (!_isInitialized.value) {
    console.warn('AdMob is not initialized. Cannot show ad.');
    return;
  }

  const options: RewardAdOptions = {
    adId: 'ca-app-pub-3940256099942544/5224354917',
    // isTesting: true
  };

  try {
    // Set the intent and timestamp before showing the ad
    adState.requestedBoostType.value = boostType;
    adState.adShownTimestamp.value = Date.now();
    await AdMob.prepareRewardVideoAd(options);
    await AdMob.showRewardVideoAd();
  } catch (error) {
    console.error('Error showing reward ad:', error);
    // Reset intent if ad fails to show
    adState.requestedBoostType.value = null;
  } finally {
    // This is for the offline modal fix, to know when the ad UI is closed.
    adState.adClosedTimestamp.value = Date.now();
  }
}
