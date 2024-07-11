package com.grishin.leetcodemotivation.user.dto;

import java.util.Date;

public record LoginResponse(String username,
                            String email,
                            String leetcodeAcc,
                            Date lastLogin, String jwtToken) {
}
