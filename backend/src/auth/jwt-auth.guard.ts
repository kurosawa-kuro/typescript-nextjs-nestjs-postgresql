import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['jwt']; // Extract token from cookie

    console.log('JWT Token:', token); // Log the token to check if it's extracted correctly

    if (!token) {
      console.error('JWT token is missing');
      throw new UnauthorizedException('JWT token missing');
    }

    try {
      const decoded = this.jwtService.verify(token);
      console.log('Decoded JWT:', decoded); // Log the decoded token
      request.user = decoded; // Attach decoded user to request
      return true;
    } catch (err) {
      console.error('Error verifying JWT:', err.message); // Log any error in verification
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
