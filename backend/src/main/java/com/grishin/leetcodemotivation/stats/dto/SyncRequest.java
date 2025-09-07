package com.grishin.leetcodemotivation.stats.dto;

import lombok.Data;

@Data
public class SyncRequest {
    private int skippedEasy;
    private int skippedMedium;
    private int skippedHard;
}