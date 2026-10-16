import { Request, Response } from 'express';
import { AppDataSource } from '../Config/data-source';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export class UserController {

    static async getAll(req: Request, res: Response) {
        try {
            const users = await userRepository.find({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            res.json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while fetching users.'
                }
            });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = parseInt(idParam, 10);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'The provided ID is not a valid number.'
                    }
                });
            }

            const user = await userRepository.findOne({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found.'
                    }
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error('Error fetching user by ID:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while fetching the user.'
                }
            });
        }

    }
    static async create(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'Name, email, and password are required.'
                    }
                });
            }

            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'EMAIL_EXISTS',
                        message: 'A user with this email already exists.'
                    }
                });
            }

            const user = userRepository.create({ name, email, password });
            const savedUser = await userRepository.save(user);

            const { password: _, ...userWithoutPassword } = savedUser;

            res.status(201).json({
                success: true,
                data: userWithoutPassword
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while creating the user.'
                }
            });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = parseInt(idParam, 10);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'The provided ID is not a valid number.'
                    }
                });
            }

            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found.'
                    }
                });
            }

            const { name, email, isActive } = req.body;

            if (email && email !== user.email) {
                const existingUser = await userRepository.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: {
                            code: 'EMAIL_EXISTS',
                            message: 'A user with this email already exists.'
                        }
                    });
                }
            }

            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            if (isActive !== undefined) user.isActive = isActive;

            const updatedUser = await userRepository.save(user);
            const { password: _, ...safeUser } = updatedUser;

            res.json({
                success: true,
                data: safeUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while updating the user.'
                }
            });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = parseInt(idParam, 10);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'The provided ID is not a valid number.'
                    }
                });
            }

            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found.'
                    }
                });
            }

            await userRepository.remove(user);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully.'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An error occurred while deleting the user.'
                }
            });
        }
    }
}