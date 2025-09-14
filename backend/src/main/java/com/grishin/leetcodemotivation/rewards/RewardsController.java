package com.grishin.leetcodemotivation.rewards;

import com.grishin.leetcodemotivation.stats.Costs;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/redeem")
@RequiredArgsConstructor
public class RewardsController {


    private final RewardsProperties rewardsConfig;
    private final RewardsService rewardsService;

    @GetMapping("/costs")
    public Costs getCosts() {
        return rewardsService.getCosts();
    }

    @GetMapping("/list")
    public ResponseEntity<List<Reward>> getRedeemList() {
        return ResponseEntity.ok(rewardsConfig.getItems());
    }

    @PostMapping
    public void redeemPoints(@RequestParam String username, @RequestParam int points) {
        rewardsService.redeemPoints(username, points);
    }
}
