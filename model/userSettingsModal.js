import mongoose, { Mongoose } from "mongoose";

const settingsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    PrivacySecurity: [
      {
        ProfileVisibility: {
          type: Boolean,
          enum: [true, false],
          default: true,
        },
        readReceipts: {
          type: Boolean,
          default: true,
        },
        twoFactorAuth: {
          type: Boolean,
          default: false,
        },
      },
    ],
    NotificationPreference: [
      {
        PushNotifications: {
          type: Boolean,
          default: false,
        },
        vibrate: {
          type: Boolean,
          default: true,
        },
        muteChats: {
          type: Boolean,
          default: false,
        },
      },
    ],
    archiveChats: [
      {
        monthlyArchive: {
          type: Boolean,
          default: false,
        },
        unarchiveOnMessage: {
          type: Boolean,
          default: true,
        },
        generateArchiveSummary: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
