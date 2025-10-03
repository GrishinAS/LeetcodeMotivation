package com.grishin.leetcodemotivation.rewards;

import com.grishin.leetcodemotivation.stats.Costs;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/redeem")
@RequiredArgsConstructor
@Slf4j
public class RewardsController {

    private final RewardsService rewardsService;

    @GetMapping("/costs")
    public Costs getCosts() {
        return rewardsService.getCosts();
    }

    @GetMapping("/list")
    public ResponseEntity<List<Reward>> getRedeemList() {
        return ResponseEntity.ok(rewardsService.getRedeemList());
    }

    @PostMapping
    public void redeemPoints(@RequestParam String username, @RequestParam String rewardId) {
        rewardsService.redeemPoints(username, rewardId);
    }
}
