package com.grishin.leetcodemotivation.stats.dto;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@NoArgsConstructor
@Data
@Table(name = "tasks")
public final class SolvedTasks {
    private int solvedEasy;
    private int solvedMedium;
    private int solvedHard;
    private Date lastSync;
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;

    public SolvedTasks(int solvedEasy, int solvedMedium, int solvedHard) {
        this.solvedEasy = solvedEasy;
        this.solvedMedium = solvedMedium;
        this.solvedHard = solvedHard;
        this.lastSync = new Date();
    }
}
