package com.grishin.leetcodemotivation.user;

import java.util.Date;

public record LoginResponse(String username,
                            String email,
                            String leetcodeAcc,
                            Date lastLogin, String jwtToken) {
}
