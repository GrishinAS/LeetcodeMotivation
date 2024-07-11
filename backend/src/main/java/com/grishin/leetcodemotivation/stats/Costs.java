package com.grishin.leetcodemotivation.stats;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "costs")
@Data
@Component
public class Costs {
    private Integer easyCost;
    private Integer mediumCost;
    private Integer hardCost;
}
