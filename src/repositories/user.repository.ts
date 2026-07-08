import { UserModel } from "../models/user.model";

export class UserRepository {
  findById(id: string) {
    return UserModel.findById(id);
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  upsertGoogleUser(payload: { name: string; email: string; googleId: string; picture: string }) {
    return UserModel.findOneAndUpdate(
      { email: payload.email },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  markPremium(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { isPremium: true }, { new: true });
  }
}
