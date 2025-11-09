import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/userModel.js";

// Sample Fort Team members to add
const fortTeamMembers = [
  {
    fname: "fort",
    lname: "admin",
    email: "admin@fortteam.com",
    pword: "fortadmin123",
    confirmPword: "fortadmin123",
    bio: "Official Fort Team Administrator - Here to help! 🛡️",
    organisation: "fortTeam",
  },
  {
    fname: "fort",
    lname: "support",
    email: "support@fortteam.com",
    pword: "fortsupport123",
    confirmPword: "fortsupport123",
    bio: "Fort Team Support - Available 24/7 for assistance 💬",
    organisation: "fortTeam",
  },
  {
    fname: "fort",
    lname: "updates",
    email: "updates@fortteam.com",
    pword: "fortupdates123",
    confirmPword: "fortupdates123",
    bio: "Fort Team Updates - Stay informed about new features! 📢",
    organisation: "fortTeam",
  },
];

export const createFortTeamMembers = async () => {
  try {
    console.log("🔧 Creating Fort Team members...");

    for (const member of fortTeamMembers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: member.email });
      if (existingUser) {
        console.log(`ℹ️ Fort Team member ${member.email} already exists`);
        continue;
      }

      // Hash passwords
      const hashedPassword = await bcrypt.hash(member.pword, 10);
      const hashedConfirmPassword = await bcrypt.hash(member.confirmPword, 10);

      // Create Fort Team member
      const newMember = await User.create({
        fname: member.fname,
        lname: member.lname,
        email: member.email,
        pword: hashedPassword,
        confirmPword: hashedConfirmPassword,
        bio: member.bio,
        organisation: member.organisation,
        rememberMe: false,
        image: "",
        status: "online",
        MyTheme: "LightMode",
        friends: [], // Will be populated as users register
      });

      console.log(`✅ Created Fort Team member: ${newMember.email}`);
    }

    console.log("🎉 Fort Team members creation complete!");
  } catch (error) {
    console.error("❌ Error creating Fort Team members:", error);
  }
};

// Function to make existing users friends with Fort Team
export const addFortTeamToExistingUsers = async () => {
  try {
    console.log("🔧 Adding Fort Team members to existing users...");

    const fortTeamMembers = await User.find({ organisation: "fortTeam" });
    const regularUsers = await User.find({
      organisation: { $ne: "fortTeam" },
    });

    if (fortTeamMembers.length === 0) {
      console.log("⚠️ No Fort Team members found");
      return;
    }

    const fortTeamIds = fortTeamMembers.map((member) => member._id);

    for (const user of regularUsers) {
      // Add Fort Team members to user's friends if not already added
      const newFriends = fortTeamIds.filter((id) => !user.friends.includes(id));
      if (newFriends.length > 0) {
        user.friends.push(...newFriends);
        await user.save();
        console.log(
          `✅ Added ${newFriends.length} Fort Team members to ${user.email}`
        );
      }
    }

    // Add all regular users to Fort Team members' friends lists
    const regularUserIds = regularUsers.map((user) => user._id);
    await User.updateMany(
      { organisation: "fortTeam" },
      { $addToSet: { friends: { $each: regularUserIds } } }
    );

    console.log("🎉 Fort Team friendship setup complete!");
  } catch (error) {
    console.error("❌ Error setting up Fort Team friendships:", error);
  }
};

// Usage example (uncomment to run):
// createFortTeamMembers();
// addFortTeamToExistingUsers();
