import { Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { UserRepository } from "../repositories/user.repository";

export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  me = async (request: AuthenticatedRequest, response: Response) => {
    const userId = request.user?.sub;
    if (!userId) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const user = await this.userRepository.findById(userId);
    return response.json({ user });
  };
}
