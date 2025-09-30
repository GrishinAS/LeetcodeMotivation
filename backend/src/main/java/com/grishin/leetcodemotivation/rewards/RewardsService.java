package com.grishin.leetcodemotivation.rewards;

import com.grishin.leetcodemotivation.payment.PaymentService;
import com.grishin.leetcodemotivation.stats.Costs;
import com.grishin.leetcodemotivation.user.UserRepository;
import com.grishin.leetcodemotivation.user.dto.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardsService {

    @Getter
    private final Costs costs;
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final RewardsProperties rewardsConfig;

    @Value("#{T(java.lang.Integer).parseInt('${payment.point.value}')}")
    private Integer pointMoneyValue;
    @Value("${app.base-url}")
    private String baseUrl;

    public void redeemPoints(String username, String rewardId) {
        User user = userRepository.findByUsername(username);
        if (user == null)
            throw new IllegalArgumentException("User " + username + " not found");

        Optional<Reward> reward = rewardsConfig.getItems().stream().filter(r -> Objects.equals(r.getId(), rewardId)).findFirst();
        if (reward.isEmpty())
            throw new IllegalArgumentException("Reward with id " + username + " not found");
        int pointsToRedeem = reward.get().getPointCost();

        if (user.getCurrentPoints() < pointsToRedeem) {
            throw new IllegalArgumentException("User " + username + " has insufficient points");
        }

        user.setCurrentPoints(user.getCurrentPoints() - pointsToRedeem);
        userRepository.save(user);
        int paymentAmount = pointsToRedeem * pointMoneyValue;
        log.info("Redeeming {} points for user {}, payment amount: {}", pointsToRedeem, username, paymentAmount);
        paymentService.sendPayment(username, paymentAmount);
    }

    public List<Reward> getRedeemList() {
        log.info("Retrieving rewards list with base url {}", baseUrl);
        List<Reward> items = rewardsConfig.getItems();
        return items.stream().map(reward -> new Reward(
                reward.getId(), reward.getTitle(), reward.getDescription(), reward.getPointCost(),
                    baseUrl + reward.getImage(),
                    reward.getCategory())
        ).toList();
    }
}
