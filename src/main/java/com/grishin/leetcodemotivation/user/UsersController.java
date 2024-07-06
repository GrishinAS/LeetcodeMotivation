package com.grishin.leetcodemotivation.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController
@RequestMapping("/user")

public class UsersController {

    @GetMapping("/login")
    public LoginResponse login(String username) {
        return new LoginResponse(new Date());
    }
}
