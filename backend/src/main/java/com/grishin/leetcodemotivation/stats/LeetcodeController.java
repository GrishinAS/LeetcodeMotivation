package com.grishin.leetcodemotivation.stats;

import com.grishin.leetcodemotivation.stats.dto.StatsResponse;
import com.grishin.leetcodemotivation.stats.dto.SyncRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/leetcode")
public class LeetcodeController {

    @Autowired
    private LeetcodeService leetcodeService;

    @GetMapping("/stats")
    public StatsResponse getStats(@RequestParam String username) {
        return leetcodeService.getStats(username);
    }

    @PostMapping("/sync")
    public StatsResponse syncStats(@RequestParam String username, @RequestBody SyncRequest syncRequest) {
        return leetcodeService.syncStats(username, syncRequest);
    }

    @GetMapping("/costs")
    public Costs getCosts() {
        return leetcodeService.getCosts();
    }

    @PostMapping("/redeem")
    public void redeemPoints(@RequestParam String username, @RequestParam int points) {
        leetcodeService.redeemPoints(username, points);
    }
}

