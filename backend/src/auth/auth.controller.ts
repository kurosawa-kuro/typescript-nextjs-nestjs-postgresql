import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.authService.register(name, email, password);
    if (success) {
      return { success: true, message: 'Registration successful' };
    } else {
      return { success: false, message: 'Registration failed' };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: object;
  }> {
    const result = await this.authService.login(email, password);
    if (result.success) {
      res.cookie('token', result.token, { // Change 'jwt' to 'token'
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      return {
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      };
    } else {
      return { success: false, message: 'Login failed' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    res.clearCookie('token'); // Change 'jwt' to 'token'
    return { success: true, message: 'Successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    console.log('Request User:', req.user); // Log the user attached to the request
    return req.user;
  }
}