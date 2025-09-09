package com.grishin.leetcodemotivation.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeetcodeCalendarResponse {
    private UserProfile matchedUser;



    @Data
    public static class UserProfile {
        private UserCalendar userCalendar;
    }

    @Data
    public class UserCalendar {
        private String submissionCalendar;
    }
}
