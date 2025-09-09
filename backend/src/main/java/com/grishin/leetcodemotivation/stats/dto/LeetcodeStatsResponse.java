package com.grishin.leetcodemotivation.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeetcodeStatsResponse {
    private List<QuestionCount> allQuestionsCount;
    private UserProfile matchedUser;

    @Data
    public static class QuestionCount {
        private String difficulty;
        private int count;

    }

    @Data
    public static class Stats {
        private List<SubmissionStats> acSubmissionNum;
        private List<SubmissionStats> totalSubmissionNum;
    }

    @Data
    public static class Profile {
        private int reputation;
        private int ranking;
    }

    @Data
    public static class Contributions {
        private int points;
    }

    @Data
    public static class UserProfile {
        private Stats submitStats;
        private Profile profile;
        private String submissionCalendar;
    }
}
