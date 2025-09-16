import { AdMob, AdmobConsentStatus, RewardAdPluginEvents, type AdLoadInfo, type AdMobRewardItem, type RewardAdOptions } from '@capacitor-community/admob';

const _isInitialized = ref(false);
export const isAdMobInitialized = readonly(_isInitialized);

/**
 * Initializes the AdMob plugin.
 * This should be called once when the app starts.
 */
export async function initializeAdMob() {
  await AdMob.initialize();

  const [trackingInfo, consentInfo] = await Promise.all([
    AdMob.trackingAuthorizationStatus(),
    AdMob.requestConsentInfo(),
  ]);

  if (trackingInfo.status === 'notDetermined') {
    /**
     * If you want to explain TrackingAuthorization before showing the iOS dialog,
     * you can show the modal here.
     * ex)
     * const modal = await this.modalCtrl.create({
     *   component: RequestTrackingPage,
     * });
     * await modal.present();
     * await modal.onDidDismiss();  // Wait for close modal
     **/

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
}

/**
 * Shows a rewarded video ad.
 * @returns A promise that resolves to true if the user earned the reward, and false otherwise.
 */
export async function showRewardVideoAd(): Promise<boolean> {
  if (!_isInitialized.value) {
    console.warn('AdMob is not initialized. Cannot show ad.');
    return false;
  }
  AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
    // Subscribe prepared rewardVideo
  });

  AdMob.addListener(
    RewardAdPluginEvents.Rewarded,
    (rewardItem: AdMobRewardItem) => {
      // Subscribe user rewarded
      console.log(rewardItem);
    },
  );

  const options: RewardAdOptions = {
    adId: 'ca-app-pub-3940256099942544/5224354917',
    // isTesting: true
    // npa: true
    // ssv: {
    //   userId: "A user ID to send to your SSV"
    //   customData: JSON.stringify({ ...MyCustomData })
    //}
  };
  await AdMob.prepareRewardVideoAd(options);
  const rewardItem = await AdMob.showRewardVideoAd();
  console.log('rewardItem', rewardItem);
  return true;
}
