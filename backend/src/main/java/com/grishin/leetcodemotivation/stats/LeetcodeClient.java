package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.stats.dto.GraphQLResponse;
import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.stats.dto.SubmissionStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.client.HttpGraphQlClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class LeetcodeClient {

    private final HttpGraphQlClient graphQlClient;

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

    public GraphQLResponse getUserProfile(String username) {
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
            log.debug("Sending GraphQL request to LeetCode API for user: {}", username);
            GraphQLResponse response = graphQlClient
                    .mutate()
                    .header("referer", "https://leetcode.com/" + username + "/")
                    .build()
                    .document(query)
                    .variable("username", username)
                    .execute()
                    .map(resp -> resp.toEntity(GraphQLResponse.class))
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
            GraphQLResponse userProfile = getUserProfile(leetcodeAccount);
            
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
}
