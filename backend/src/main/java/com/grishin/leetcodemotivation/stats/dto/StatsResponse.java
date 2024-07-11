package com.grishin.leetcodemotivation.stats.dto;

public record StatsResponse(
        SolvedTasks oldStat,
        SolvedTasks newStat
) {
}

