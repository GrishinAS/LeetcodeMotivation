package com.grishin.leetcodemotivation.stats.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Embeddable
@Data
@NoArgsConstructor
public final class SolvedTasks {

    @Column(name = "solved_easy")
    private int solvedEasy;

    @Column(name = "solved_medium")
    private int solvedMedium;

    @Column(name = "solved_hard")
    private int solvedHard;

    @Column(name = "last_sync")
    private Instant lastSync;

    public SolvedTasks(int solvedEasy, int solvedMedium, int solvedHard) {
        this.solvedEasy = solvedEasy;
        this.solvedMedium = solvedMedium;
        this.solvedHard = solvedHard;
        this.lastSync = Instant.now();
    }
}
