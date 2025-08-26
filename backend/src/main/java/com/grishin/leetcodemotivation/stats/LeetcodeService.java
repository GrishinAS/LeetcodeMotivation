package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.payment.PaymentService;
import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.stats.dto.StatsResponse;
import com.grishin.leetcodemotivation.user.UserRepository;
import com.grishin.leetcodemotivation.user.dto.User;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LeetcodeService {

    @Value("#{T(java.lang.Integer).parseInt('${payment.point.value}')}")
    private Integer pointMoneyValue;
    @Autowired
    private PaymentService paymentService;
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
        return new StatsResponse(
                user.getSolvedTasks(),
                currentStat,
                user.getLastLogin(),
                user.getCurrentPoints()
        );
    }

    public StatsResponse syncStats(String username) {
        log.info("Syncing stats for user {}", username);
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new IllegalArgumentException("User " + username + " not found");

        SolvedTasks oldStat = user.getSolvedTasks();
        SolvedTasks currentStat = leetcodeClient.getCurrentStat(user.getLeetcodeAcc());
        
        // Calculate points earned since last sync
        int easyPointsEarned = (currentStat.getSolvedEasy() - oldStat.getSolvedEasy()) * costs.getEasyCost();
        int mediumPointsEarned = (currentStat.getSolvedMedium() - oldStat.getSolvedMedium()) * costs.getMediumCost();
        int hardPointsEarned = (currentStat.getSolvedHard() - oldStat.getSolvedHard()) * costs.getHardCost();
        
        int pointsEarned = easyPointsEarned + mediumPointsEarned + hardPointsEarned;

        int newTotalPoints = user.getCurrentPoints() + pointsEarned;
        user.setCurrentPoints(newTotalPoints);

        currentStat.setId(oldStat.getId());
        user.setSolvedTasks(currentStat);

        userRepository.save(user);
        
        log.info("Stats synced for user {}: earned {} points, total points: {}", username, pointsEarned, newTotalPoints);
        
        return new StatsResponse(
                oldStat,
                currentStat,
                user.getLastLogin(),
                newTotalPoints
        );
    }

    public void redeemPoints(String username, int pointsToRedeem) {
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new IllegalArgumentException("User " + username + " not found");
            
        if (user.getCurrentPoints() < pointsToRedeem) {
            throw new IllegalArgumentException("User " + username + " has insufficient points");
        }

        user.setCurrentPoints(user.getCurrentPoints() - pointsToRedeem);
        userRepository.save(user);

        int paymentAmount = pointsToRedeem * pointMoneyValue;
        log.info("Redeeming {} points for user {}, payment amount: {}", pointsToRedeem, username, paymentAmount);
        paymentService.sendPayment(username, paymentAmount);
    }
}
