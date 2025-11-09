import mongoose from "mongoose";

const FlashRoomSchema = mongoose.Schema(
  {
    // Room admin - now properly referenced
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic room info
    roomName: {
      type: String,
      required: true,
    },
    roomDescription: {
      type: String,
      required: true,
    },

    // Destruction setup
    destructionType: {
      type: String,
      enum: ["timer", "read", "exit"],
      default: "timer",
    },
    roomDestructionDate: {
      type: Date, // Used if destructionType is 'timer'
    },
    isDestroyed: {
      type: Boolean,
      default: false,
    },
    destroyedAt: {
      type: Date,
    },

    // Destruction logic helpers
    allMembersRead: {
      type: Boolean,
      default: false, // Used if destructionType is 'read'
    },
    allowExport: {
      type: Boolean,
      default: false,
    },
    isExported: {
      type: Boolean,
      default: false,
    },

    // Core members and messages
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlashRoomMessages",
      },
    ],

    // Optional room identifier
    roomID: {
      type: String,
    },
    removedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },  
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for countdown
FlashRoomSchema.virtual("timeRemaining").get(function () {
  if (!this.roomDestructionDate) return null;
  const now = new Date();
  return Math.max(0, this.roomDestructionDate - now);
});

// Optional TTL index for auto-expiry if using destructionType === 'timer'
FlashRoomSchema.index({ roomDestructionDate: 1 }, { expireAfterSeconds: 0 });

const FlashRoom = mongoose.model("FlashRoom", FlashRoomSchema);

export default FlashRoom;
