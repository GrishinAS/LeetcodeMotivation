package com.grishin.leetcodemotivation.stats;

public record StatsResponse(
        SolvedTasks oldStat,
        SolvedTasks newStat
) {
}

record SolvedTasks(
        int solvedEasy,
        int solvedMedium,
        int solvedHard
) {

}
