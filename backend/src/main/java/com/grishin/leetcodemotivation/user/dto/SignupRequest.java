package com.grishin.leetcodemotivation.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "Name cannot be blank")
        String username,

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email cannot be blank")
        String email,

        @NotBlank(message = "Leetcode account cannot be blank")
        String leetcodeAccount,

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
        String password) {

        @Override
        public String toString() {
                return "SignupRequest{" +
                        "username='" + username + '\'' +
                        ", email='" + email + '\'' +
                        ", leetcodeAccount='" + leetcodeAccount + '\'' +
                        '}';
        }
}
