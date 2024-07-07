package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.payment.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/leetcode")
@CrossOrigin(origins = "http://localhost:9000")
public class StatsController {

    @Value("#{T(java.lang.Integer).parseInt('${payment.point.value}')}")
    private Integer pointMoneyValue;

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/stats")
    public StatsResponse getStats(@RequestParam String username) {
        return new StatsResponse(
                new SolvedTasks(1, 2, 3),
                new SolvedTasks(1, 4, 3)
        );
    }

    @PostMapping("/redeem")
    public void redeemPoints(@RequestParam String username, @RequestParam int points) {
        int paymentAmount = points * pointMoneyValue;
        paymentService.sendPayment(username, paymentAmount);
        // get total amount of points
        // send money
        // record new stats
    }
}

