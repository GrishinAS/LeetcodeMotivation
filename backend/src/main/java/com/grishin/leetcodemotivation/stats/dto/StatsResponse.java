package com.grishin.leetcodemotivation.stats.dto;

import java.util.Date;

public record StatsResponse(
        SolvedTasks oldStat,
        SolvedTasks newStat,
        Date lastSync,
        Integer currentPoints
) {
}

