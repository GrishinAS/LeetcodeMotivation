package com.grishin.leetcodemotivation.rewards;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reward {
    private String id;
    private String title;
    private String description;
    private int pointCost;
    private String image;
    private String category;
}
