package com.grishin.leetcodemotivation.rewards;

import com.grishin.leetcodemotivation.payment.PaymentService;
import com.grishin.leetcodemotivation.stats.Costs;
import com.grishin.leetcodemotivation.user.UserRepository;
import com.grishin.leetcodemotivation.user.dto.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardsService {

    @Getter
    private final Costs costs;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @Value("#{T(java.lang.Integer).parseInt('${payment.point.value}')}")
    private Integer pointMoneyValue;

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
