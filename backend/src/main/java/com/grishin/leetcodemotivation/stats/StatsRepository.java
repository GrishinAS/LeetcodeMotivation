package com.grishin.leetcodemotivation.stats;


import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatsRepository extends JpaRepository<SolvedTasks, Long> {
}

