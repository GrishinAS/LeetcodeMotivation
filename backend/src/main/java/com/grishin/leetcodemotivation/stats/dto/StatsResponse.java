package com.grishin.leetcodemotivation.stats.dto;

import java.time.Instant;

public record StatsResponse(
        SolvedTasks oldStat,
        SolvedTasks newStat,
        Instant lastSync,
        Integer currentPoints
) {
}

