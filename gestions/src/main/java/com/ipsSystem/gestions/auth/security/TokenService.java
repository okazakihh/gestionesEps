package com.ipsSystem.gestions.auth.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public String generateToken(UserDetails userDetails) {
        return jwtUtil.generateToken(userDetails);
    }
    
    public String extractUsername(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        return jwtUtil.validateToken(token, userDetails);
    }
}
