package com.grishin.leetcodemotivation.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PaymentService {
    public void sendPayment(String username, int money) {
        log.info("Payment {} for username {}", money, username);
    }
}


