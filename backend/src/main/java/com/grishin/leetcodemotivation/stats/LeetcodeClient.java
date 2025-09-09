package com.grishin.leetcodemotivation.stats;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grishin.leetcodemotivation.stats.dto.LeetcodeCalendarResponse;
import com.grishin.leetcodemotivation.stats.dto.LeetcodeStatsResponse;
import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.stats.dto.SubmissionStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.client.HttpGraphQlClient;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class LeetcodeClient {

    private final HttpGraphQlClient graphQlClient;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public LeetcodeClient() {
        log.info("Initializing LeetcodeClient with GraphQL endpoint: https://leetcode.com/graphql");
        this.graphQlClient = HttpGraphQlClient.builder()
                .url("https://leetcode.com/graphql")
                .build();
        log.debug("LeetcodeClient successfully initialized");
    }

    public static void main(String[] args) {
        SolvedTasks currentStat = new LeetcodeClient().getCurrentStat("ghjdthrfafbkj");
        System.out.println(currentStat);
    }

    public LeetcodeStatsResponse getUserProfile(String username) {
        log.info("Fetching user profile for LeetCode username: {}", username);
        
        String query = "query getUserProfile($username: String!) { " +
                "matchedUser(username: $username) { " +
                "submitStats { " +
                "acSubmissionNum { difficulty count submissions } " +
                "totalSubmissionNum { difficulty count submissions } " +
                "} " +
                "} " +
                "}";

        log.debug("GraphQL query for user {}: {}", username, query);
        
        try {
            LeetcodeStatsResponse response = graphQlClient
                    .mutate()
                    .header("referer", "https://leetcode.com/" + username + "/")
                    .build()
                    .document(query)
                    .variable("username", username)
                    .execute()
                    .map(resp -> resp.toEntity(LeetcodeStatsResponse.class))
                    .block();
            
            if (response != null && response.getMatchedUser() != null) {
                log.info("Successfully fetched profile for user: {}", username);
                log.debug("User profile response: {}", response);
            } else {
                log.warn("No user profile found for username: {} (user might not exist)", username);
            }
            
            return response;
        } catch (Exception e) {
            log.error("Failed to fetch user profile for username: {}. Error: {}", username, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch LeetCode profile for user: " + username, e);
        }
    }

    public SolvedTasks getCurrentStat(String leetcodeAccount) {
        log.info("Getting current statistics for LeetCode account: {}", leetcodeAccount);
        
        try {
            LeetcodeStatsResponse userProfile = getUserProfile(leetcodeAccount);
            
            if (userProfile == null || userProfile.getMatchedUser() == null) {
                log.error("No user profile data received for account: {}", leetcodeAccount);
                throw new RuntimeException("No user data found for LeetCode account: " + leetcodeAccount);
            }
            
            if (userProfile.getMatchedUser().getSubmitStats() == null) {
                log.error("No submission statistics found for account: {}", leetcodeAccount);
                throw new RuntimeException("No submission statistics found for account: " + leetcodeAccount);
            }
            
            log.debug("Processing submission statistics for account: {}", leetcodeAccount);
            Map<String, Integer> byDifficulty = userProfile
                    .getMatchedUser()
                    .getSubmitStats()
                    .getAcSubmissionNum()
                    .stream()
                    .collect(
                            Collectors.toMap(
                                    SubmissionStats::getDifficulty,
                                    SubmissionStats::getCount));
            
            log.debug("Difficulty breakdown for {}: {}", leetcodeAccount, byDifficulty);
            
            Integer easyCount = byDifficulty.get("Easy");
            Integer mediumCount = byDifficulty.get("Medium");
            Integer hardCount = byDifficulty.get("Hard");
            
            if (easyCount == null || mediumCount == null || hardCount == null) {
                log.warn("Missing difficulty data for account: {}. Easy: {}, Medium: {}, Hard: {}", 
                        leetcodeAccount, easyCount, mediumCount, hardCount);
                easyCount = easyCount != null ? easyCount : 0;
                mediumCount = mediumCount != null ? mediumCount : 0;
                hardCount = hardCount != null ? hardCount : 0;
            }
            
            SolvedTasks result = new SolvedTasks(easyCount, mediumCount, hardCount);
            log.info("Successfully retrieved statistics for {}: Easy={}, Medium={}, Hard={}", 
                    leetcodeAccount, easyCount, mediumCount, hardCount);
            
            return result;
        } catch (Exception e) {
            log.error("Failed to get current statistics for account: {}. Error: {}", 
                    leetcodeAccount, e.getMessage(), e);
            throw new RuntimeException("Failed to get statistics for LeetCode account: " + leetcodeAccount, e);
        }
    }

    public Map<LocalDate, Integer> getSubmissionCalendar(String account) {
        log.info("Getting submission calendar for account: {}", account);

        String query = """
                query": "query userProfileCalendar($username: String!, $year: Int) {  matchedUser(username: $username) {   userCalendar(year: $year) {      submissionCalendar}}}
                """;

        log.debug("userProfileCalendar query for user {}, : {}", account, query);

        try {
            LeetcodeCalendarResponse response = graphQlClient
                    .mutate()
                    .header("referer", "https://leetcode.com/" + account + "/")
                    .build()
                    .document(query)
                    .variable("username", account)
                    .execute()
                    .map(resp -> resp.toEntity(LeetcodeCalendarResponse.class))
                    .block();

            if (response != null && response.getMatchedUser() != null) {
                log.info("Successfully fetched calendar for user: {}", account);
                log.debug("Calendar response: {}", response);
            } else {
                throw new RuntimeException("No calendar found for username: + " + account + " (user might not exist)");
            }

            Map<LocalDate, Integer> submissionsByDate = getSubmissionsByDate(response.getMatchedUser().getUserCalendar().getSubmissionCalendar());
            log.info("Successfully parsed calendar for user: {}", account);
            log.debug("Parsed Calendar: {}", submissionsByDate);
            return submissionsByDate;

        } catch (Exception e) {
            log.error("Failed to fetch calendar for username: {}. Error: {}", account, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch calendar for user: " + account, e);
        }
    }


    private Map<LocalDate, Integer> getSubmissionsByDate(String submissionCalendar) {
        if (submissionCalendar == null || submissionCalendar.trim().isEmpty()) {
            return new LinkedHashMap<>();
        }

        try {
            Map<String, Integer> timestampMap = OBJECT_MAPPER.readValue(
                    submissionCalendar,
                    new TypeReference<>() {
                    }
            );

            Map<LocalDate, Integer> dateMap = new LinkedHashMap<>();
            timestampMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        long timestamp = Long.parseLong(entry.getKey());
                        LocalDate date = Instant.ofEpochSecond(timestamp)
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate();
                        dateMap.put(date, entry.getValue());
                    });

            return dateMap;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse submission calendar", e);
        }
    }
}
