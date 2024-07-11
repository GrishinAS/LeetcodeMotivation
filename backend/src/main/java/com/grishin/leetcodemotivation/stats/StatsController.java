package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.stats.dto.StatsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/leetcode")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping("/stats")
    public StatsResponse getStats(@RequestParam String username) {
        return statsService.getStats(username);
    }

    @GetMapping("/costs")
    public Costs getCosts() {
        return statsService.getCosts();
    }

    @PostMapping("/redeem")
    public void redeemPoints(@RequestParam String username) {
        statsService.redeemPoints(username);
    }
}

