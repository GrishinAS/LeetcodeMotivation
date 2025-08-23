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
                user.getLastLogin()
        );
    }

    public void redeemPoints(String username) {
        StatsResponse stats = getStats(username);

        SolvedTasks oldStat = stats.oldStat();
        SolvedTasks newStat = stats.newStat();

        int easyPointsEarned = (newStat.getSolvedEasy() - oldStat.getSolvedEasy()) * costs.getEasyCost();
        int mediumPointsEarned = (newStat.getSolvedMedium() - oldStat.getSolvedMedium()) * costs.getMediumCost();
        int hardPointsEarned = (newStat.getSolvedHard() - oldStat.getSolvedHard()) * costs.getHardCost();

        int totalPoints =  easyPointsEarned + mediumPointsEarned + hardPointsEarned;

        int paymentAmount = totalPoints * pointMoneyValue;
        log.info("Amount to be paid to user {} is {}", username, paymentAmount);
        paymentService.sendPayment(username, paymentAmount);

        newStat.setId(oldStat.getId());
        statsRepository.save(newStat);
        log.info("Stats updated to {} for user {}", newStat, username);
    }
}
