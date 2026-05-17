package com.grishin.leetcodemotivation.user;

import com.grishin.leetcodemotivation.spring.security.JwtService;
import com.grishin.leetcodemotivation.user.dto.LoginRequest;
import com.grishin.leetcodemotivation.user.dto.LoginResponse;
import com.grishin.leetcodemotivation.user.dto.SignupRequest;
import com.grishin.leetcodemotivation.user.dto.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UsersController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        String token = jwtService.generateToken(user.getEmail());
        LoginResponse body = new LoginResponse(user.getUsername(), user.getEmail(), user.getLeetcodeAcc(), token);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest requestDto) {
        userService.signup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        Optional<User> user = userService.findUser(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(user.get());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless — actual logout is handled client-side by discarding the token
        return ResponseEntity.ok().build();
    }
}
