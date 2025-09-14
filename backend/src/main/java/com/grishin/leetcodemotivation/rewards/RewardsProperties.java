package com.grishin.leetcodemotivation.rewards;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "rewards")
public class RewardsProperties {
    private List<Reward> items;
}
