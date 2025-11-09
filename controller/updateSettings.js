import Settings from "../model/userSettingsModal.js";
import asyncHandler from "express-async-handler";

// get user settings
export const getUserSettings = asyncHandler(async (req, res) => {
  const myId = req.myID;
  console.log("getting user settings");
  if (!myId) {
    console.log("error")
    return res.status(401).json({
      error: "Unable to retrieve settings due to unauthorized access",
    });
  }
  const isUserSettings = await Settings.findOne({ user: myId.toString() })
  // if (!isUserSettings) {
  //   return res.status(200).json({
  //     error: "there was an error getting your settings",
  //   });
  // }
  const simplifiedSettings = {
    _id: isUserSettings._id,
    user: isUserSettings.user,
    ProfileVisibility: isUserSettings.PrivacySecurity[0].ProfileVisibility,
    ReadReceipts: isUserSettings.PrivacySecurity[0].readReceipts,
    TwoFactorauth: isUserSettings.PrivacySecurity[0].twoFactorAuth,
    PushNotification:
      isUserSettings.NotificationPreference[0].PushNotifications,
    MuteChats: isUserSettings.NotificationPreference[0].muteChats,
    Vibration: isUserSettings.NotificationPreference[0].vibrate,
    isMonthlyArchived: isUserSettings.archiveChats[0].monthlyArchive,
    UnarchiveOnMessage: isUserSettings.archiveChats[0].unarchiveOnMessage,
    GenerateSummary: isUserSettings.archiveChats[0].generateArchiveSummary,
  };
  console.log("user settings retrieved");
  return res.status(200).json({
    userSettings: simplifiedSettings,
  });
});

export const changeProfileVisibilityController = asyncHandler(
  async (req, res) => {
    console.log("updating profile Visibility");
    const { visibility } = req.body;
    const myId = req.myID;
    const isUserSettings = await Settings.findOneAndUpdate(
      { user: myId.toString() },
      {
        $set: {
          "PrivacySecurity.0.ProfileVisibility":
            visibility === "false" ? true : false,
        },
      },
      {
        new: true,
      }
    );
    if (!isUserSettings) {
      return res.status(400).json({
        error: "there was an error trying to update your visibility settings",
      });
    }
    console.log(
      "success,profile visibility set to ",
      isUserSettings.PrivacySecurity[0].ProfileVisibility
    );
    let visibilityState;
    if (isUserSettings.PrivacySecurity[0].ProfileVisibility === true) {
      visibilityState = "on";
    } else {
      visibilityState = "off";
    }
    await isUserSettings.save();
    const simplifiedSettings = {
      _id: isUserSettings._id,
      user: isUserSettings.user,
      ProfileVisibility: isUserSettings.PrivacySecurity[0].ProfileVisibility,
      ReadReceipts: isUserSettings.PrivacySecurity[0].readReceipts,
      TwoFactorauth: isUserSettings.PrivacySecurity[0].twoFactorAuth,
      PushNotification:
        isUserSettings.NotificationPreference[0].PushNotifications,
      MuteChats: isUserSettings.NotificationPreference[0].muteChats,
      Vibration: isUserSettings.NotificationPreference[0].vibrate,
      isMonthlyArchived: isUserSettings.archiveChats[0].monthlyArchive,
      UnarchiveOnMessage: isUserSettings.archiveChats[0].unarchiveOnMessage,
      GenerateSummary: isUserSettings.archiveChats[0].generateArchiveSummary,
    };
    console.log(`Successfully turned ${visibilityState} profile visibility`);
    res.status(200).json({
      message: `Successfully turned ${visibilityState} profile visibility`,
      userSettings: simplifiedSettings,
      newVisibility: isUserSettings.PrivacySecurity[0].ProfileVisibility,
    });
  }
);
