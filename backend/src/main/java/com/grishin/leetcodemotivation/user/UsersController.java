package com.grishin.leetcodemotivation.user;

import com.grishin.leetcodemotivation.spring.security.JWTUtilities;
import com.grishin.leetcodemotivation.user.dto.LoginRequest;
import com.grishin.leetcodemotivation.user.dto.LoginResponse;
import com.grishin.leetcodemotivation.user.dto.SignupRequest;
import com.grishin.leetcodemotivation.user.dto.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UsersController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        String token = JWTUtilities.generateToken(request.email());
        LoginResponse body = new LoginResponse(
                user.getUsername(),
                user.getEmail(),
                user.getLeetcodeAcc(),
                token);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest requestDto) {
        userService.signup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/csrf")
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    }
}
