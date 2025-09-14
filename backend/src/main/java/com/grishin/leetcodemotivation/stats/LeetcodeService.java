package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.stats.dto.StatsResponse;
import com.grishin.leetcodemotivation.stats.dto.SyncRequest;
import com.grishin.leetcodemotivation.user.UserRepository;
import com.grishin.leetcodemotivation.user.dto.User;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
@Slf4j
public class LeetcodeService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StatsRepository statsRepository;
    @Autowired
    private LeetcodeClient leetcodeClient;

    @Autowired
    @Getter
    private Costs costs;

    public StatsResponse getStats(String username) {
        log.info("Stats requested for user {}", username);
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new IllegalArgumentException("User " + username + " not found");
        log.info("User {} with leetcode account {} and previous stats {} found, requesting stats", username, user.getLeetcodeAcc(), user.getSolvedTasks());
        SolvedTasks currentStat = leetcodeClient.getCurrentStat(user.getLeetcodeAcc());
        log.info("Current solved tasks: {}", currentStat);
        int streak = calculateStreak(user.getLeetcodeAcc());
        return new StatsResponse(
                user.getSolvedTasks(),
                currentStat,
                user.getSolvedTasks() != null ? user.getSolvedTasks().getLastSync() : null,
                user.getCurrentPoints()
        );
    }

    private int calculateStreak(String leetcodeAcc) {
        Map<LocalDate, Integer> submissionCalendar = leetcodeClient.getSubmissionCalendar(leetcodeAcc);
        int streak = 0;
        // Do we count today? does it even return today's submission?
        for (LocalDate localDate : submissionCalendar.keySet()) {
            // starting from today check every day backwards until there is an empty value and increase count
        }
        return streak;
    }

    public StatsResponse syncStats(String username, SyncRequest syncRequest) {
        log.info("Syncing stats for user {} with skip data: easy={}, medium={}, hard={}", 
                username, syncRequest.getSkippedEasy(), syncRequest.getSkippedMedium(), syncRequest.getSkippedHard());
        
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new IllegalArgumentException("User " + username + " not found");

        SolvedTasks oldStat = user.getSolvedTasks();
        SolvedTasks currentStat = leetcodeClient.getCurrentStat(user.getLeetcodeAcc());
        
        // Calculate tasks solved since last sync for validation
        int easySinceLastSync = currentStat.getSolvedEasy() - oldStat.getSolvedEasy();
        int mediumSinceLastSync = currentStat.getSolvedMedium() - oldStat.getSolvedMedium();
        int hardSinceLastSync = currentStat.getSolvedHard() - oldStat.getSolvedHard();
        
        // Validate skip amounts
        validateSkipAmount(syncRequest.getSkippedEasy(), easySinceLastSync, "easy");
        validateSkipAmount(syncRequest.getSkippedMedium(), mediumSinceLastSync, "medium");
        validateSkipAmount(syncRequest.getSkippedHard(), hardSinceLastSync, "hard");
        
        // Calculate points earned since last sync (subtract skipped tasks)
        int easyPointsEarned = Math.max(0, easySinceLastSync - syncRequest.getSkippedEasy()) * costs.getEasyCost();
        int mediumPointsEarned = Math.max(0, mediumSinceLastSync - syncRequest.getSkippedMedium()) * costs.getMediumCost();
        int hardPointsEarned = Math.max(0, hardSinceLastSync - syncRequest.getSkippedHard()) * costs.getHardCost();
        
        int pointsEarned = easyPointsEarned + mediumPointsEarned + hardPointsEarned;

        int newTotalPoints = user.getCurrentPoints() + pointsEarned;
        user.setCurrentPoints(newTotalPoints);

        currentStat.setId(oldStat.getId());
        currentStat.setLastSync(new java.util.Date());
        user.setSolvedTasks(currentStat);

        userRepository.save(user);
        
        log.info("Stats synced for user {}: earned {} points (after skipping {} easy, {} medium, {} hard), total points: {}", 
                username, pointsEarned, syncRequest.getSkippedEasy(), syncRequest.getSkippedMedium(), 
                syncRequest.getSkippedHard(), newTotalPoints);
        
        return new StatsResponse(
                oldStat,
                currentStat,
                currentStat.getLastSync(),
                newTotalPoints
        );
    }
    
    private void validateSkipAmount(int skippedAmount, int totalSinceSync, String difficulty) {
        if (skippedAmount < 0) {
            throw new IllegalArgumentException("Skipped " + difficulty + " tasks cannot be negative");
        }
        if (skippedAmount > totalSinceSync) {
            throw new IllegalArgumentException("Cannot skip more " + difficulty + " tasks (" + skippedAmount + 
                    ") than solved since last sync (" + totalSinceSync + ")");
        }
    }


}
