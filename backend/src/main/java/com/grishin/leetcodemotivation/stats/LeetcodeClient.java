package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.stats.dto.GraphQLResponse;
import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.stats.dto.SubmissionStats;
import org.springframework.graphql.client.HttpGraphQlClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class LeetcodeClient {

    private final HttpGraphQlClient graphQlClient;

    public LeetcodeClient() {
        this.graphQlClient = HttpGraphQlClient.builder()
                .url("https://leetcode.com/graphql")
                .build();
    }

    public static void main(String[] args) {
        SolvedTasks currentStat = new LeetcodeClient().getCurrentStat("ghjdthrfafbkj");
        System.out.println(currentStat);
    }

    public GraphQLResponse getUserProfile(String username) {
        String query = "query getUserProfile($username: String!) { " +
//                "allQuestionsCount { difficulty count } " +
                "matchedUser(username: $username) { " +
//                "contributions { points } " +
//                "profile { reputation ranking } " +
//                "submissionCalendar " +
                "submitStats { " +
                "acSubmissionNum { difficulty count submissions } " +
                "totalSubmissionNum { difficulty count submissions } " +
                "} " +
                "} " +
                "}";

        return graphQlClient
                .mutate()
                .header("referer", "https://leetcode.com/" + username + "/")
                .build()
                .document(query)
                .variable("username", username)
                .execute()
                .map(response -> response.toEntity(GraphQLResponse.class))
                .block();
    }

    public SolvedTasks getCurrentStat(String leetcodeAccount) {
        GraphQLResponse userProfile = getUserProfile(leetcodeAccount);
        Map<String, Integer> byDifficulty = userProfile
                .getMatchedUser()
                .getSubmitStats()
                .getAcSubmissionNum()
                .stream()
                .collect(
                        Collectors.toMap(
                                SubmissionStats::getDifficulty,
                                SubmissionStats::getCount));
        return new SolvedTasks(
                byDifficulty.get("Easy"),
                byDifficulty.get("Medium"),
                byDifficulty.get("Hard")
        );
    }
}
