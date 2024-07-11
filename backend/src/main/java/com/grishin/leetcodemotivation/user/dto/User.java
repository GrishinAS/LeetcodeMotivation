package com.grishin.leetcodemotivation.user.dto;

import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public final class User {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private String username;
    private String email;
    private String hashedPw;
    private String leetcodeAcc;
    private Date lastLogin;
    @OneToOne
    private SolvedTasks solvedTasks;

    public User(String username, String email, String hashedPw, String leetcodeAcc, Date lastLogin) {
        this.username = username;
        this.email = email;
        this.hashedPw = hashedPw;
        this.leetcodeAcc = leetcodeAcc;
        this.lastLogin = lastLogin;
    }

    // later: add payment destination, payment info, authorization
}
